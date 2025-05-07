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

  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from('Subscriptions')
    .select('*')
    .eq('user_id', user.id)
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

    const systemPrompt = `Generate a high-resolution 3D cartoon-style render of the food-truck shown in the reference image.

        • Match the trucks proportions, paint colors, logos, and other distinctive markings so the render clearly represents the same vehicle.  
        • Retain ONLY the truck itself—remove all background and surrounding objects (coolers, signs, people, trees, etc.).  
        • Keep just the large, important lettering that is easy to read; omit or simplify small text. Spell any retained words exactly as they appear.  
        • Composition: show the entire truck inside the frame with no edges cropped. Camera angle is a right-facing, driver-side profile with a slight front-quarter turn (≈15°).  
        • Output on a 100% transparent background`;

    
    const result = await openai.images.edit({
      model: "gpt-image-1",
      image: file, // Pass the prepared file object
      prompt: systemPrompt,
      n: 1,
      size: "1024x1024",
      quality: "high", // High quality recommended for transparency
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