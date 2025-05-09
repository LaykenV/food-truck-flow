import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Readable } from 'stream';
import { createClient } from '@/utils/supabase/server';
// Ensure the API key is set in environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Helper function to convert ReadableStream to Buffer
async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
    }
  }
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set.');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('user', user);

  const { data: foodTruckData, error: foodTruckError } = await supabase
    .from('FoodTrucks')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (foodTruckError) {
    console.error('Error fetching food truck data:', foodTruckError);
    return NextResponse.json({ error: 'Error fetching food truck data.' }, { status: 500 });
  }

  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from('Subscriptions')
    .select('*')
    .eq('stripe_customer_id', foodTruckData?.stripe_customer_id)
    .single();

  if (subscriptionError) {
    console.error('Error fetching subscription data:', subscriptionError);
    return NextResponse.json({ error: 'Error fetching subscription data.' }, { status: 500 });
  }

  if (subscriptionData?.status !== 'active') {
    return NextResponse.json({ error: 'You must be a paid subscriber to generate a 3D model.' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('truckImage') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided.' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds the limit of 5MB.' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}` }, 
        { status: 400 } 
      );
    }

    console.log(`Generating 3D model for: ${file.name}, type: ${file.type}, size: ${file.size}`);
    
    const systemPrompt = `
    Generate a high-resolution 3D cartoon-style render of the food truck shown in the reference image.

    • Match proportions, paint colors, logos, distinctive markings.
    • Truck ONLY. Remove all background/surrounding objects.
    • Text: Large, important, readable ONLY. Spell EXACTLY. Omit small/detailed text.
    • Composition (CRITICAL): Entire truck visible, NO cropping. Center with padding. If needed, zoom out to fit all parts.
    • Camera: Right-facing, driver-side profile, slight front turn (≈15°).
    • Output on a 100% transparent background.
`;

    
    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: file, // Pass the prepared file object
      prompt: systemPrompt,
      n: 1,
      size: "1024x1024",
      quality: "medium", // High quality recommended for transparency
    });

    const image_base64 = result.data?.[0]?.b64_json;

    if (!image_base64) {
      console.error('OpenAI API did not return image data.');
      return NextResponse.json({ error: 'Failed to generate image data.' }, { status: 500 });
    }

    console.log(`Successfully generated model for: ${file.name}`);
    return NextResponse.json({ imageData: image_base64 });

  } catch (error: any) {
    console.error('Error generating image:', error);

    let errorMessage = 'An unexpected error occurred during image generation.';
    let statusCode = 500;

    if (error instanceof OpenAI.APIError) {
        errorMessage = `OpenAI API Error: ${error.status} ${error.name} ${error.message}`;
        statusCode = error.status || 500;
    } else if (error.message) {
        errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
} 