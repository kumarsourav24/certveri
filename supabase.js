// Initialize Supabase Client
const supabaseUrl = 'https://olrfyuqdwvrjnrzmgznj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9scmZ5dXFkd3Zyam5yem1nem5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NDgyOTYsImV4cCI6MjA5MzAyNDI5Nn0.CzSR-bv6KpLqfaHsVr7oknAfHlQqC-6Pt6YPgIA30kA';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

async function verifyEmailAndGetCertificate(email) {
    try {
        const { data, error } = await supabaseClient
            .from('ecommerce_certificates')
            .select('name, certificate_id')
            .eq('email', email.toLowerCase())
            .single();

        if (error) {
            console.error('Supabase query error:', error);
            if (error.code === 'PGRST116') {
                // No rows returned
                return { success: false, error: 'No certificate found for this email.' };
            }
            return { success: false, error: 'Failed to verify email due to server error.' };
        }

        if (data) {
            return { success: true, data: data };
        }

    } catch (error) {
        console.error('Unexpected error during verification:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}

async function verifyCertificateById(certId) {
    try {
        const { data, error } = await supabaseClient
            .from('ecommerce_certificates')
            .select('name, email, created_at')
            .eq('certificate_id', certId.toUpperCase())
            .single();

        if (error) {
            console.error('Supabase query error:', error);
            if (error.code === 'PGRST116') {
                return { success: false, error: 'Invalid Certificate ID. No record found.' };
            }
            return { success: false, error: 'Failed to verify due to server error.' };
        }

        if (data) {
            return { success: true, data: data };
        }

    } catch (error) {
        console.error('Unexpected error during ID verification:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}
