// Supabase Edge Function: verify-admin
// Validates admin password against the secret "PASSWORD" stored in Supabase Secrets

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();
    const secretPassword = Deno.env.get("PASSWORD");

    if (!secretPassword) {
      return new Response(
        JSON.stringify({ 
          authorized: false, 
          error: "Edge function secret 'PASSWORD' is not set in Supabase" 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const isMatch = password === secretPassword;

    return new Response(
      JSON.stringify({ 
        authorized: isMatch,
        message: isMatch ? "Authorized successfully" : "Invalid password"
      }),
      { 
        status: isMatch ? 200 : 401, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ authorized: false, error: err.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
