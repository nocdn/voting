import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
	'https://dduxgrvpsfbjilpaqyay.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkdXhncnZwc2ZiamlscGFxeWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MDY5MzQsImV4cCI6MjA1ODA4MjkzNH0.xR5iQMZq5CyMv2xBkCQhpFf0HRNjkg_zqMooRiYyd28'
);
