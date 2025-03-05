//make a client test page
"use client";
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";

export default function ClientTest() {
  const supabase = createClient();
  useEffect(() => {

    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      console.log("data", data.user);
    };

    getUser();
  }, []);
  return (
    <div>
      <h1>Client Test</h1>
    </div>
  );
}