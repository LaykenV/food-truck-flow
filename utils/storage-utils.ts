import { createClient } from "@/utils/supabase/client";

/**
 * Uploads an image to Supabase Storage and returns the public URL
 * @param file - The file to upload
 * @param bucket - The storage bucket name ('logo-images', 'hero-images', 'about-images')
 * @param userId - The user ID to include in the file path
 * @returns Promise resolving to the public URL or null if upload fails
 */
export async function uploadImage(
  file: File, 
  bucket: string, 
  userId: string
): Promise<string | null> {
  try {
    const supabase = createClient();
    
    // Generate a unique filename to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // Perform the upload
    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
} 