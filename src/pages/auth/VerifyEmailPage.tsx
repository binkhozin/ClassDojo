import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../integrations/supabase";
import { AuthCard } from "../../components/auth/AuthCard";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [status, setStatus] = useState<'success' | 'error' | 'pending'>('pending');

  useEffect(() => {
    // In many Supabase setups, verification happens automatically via the link
    // We can check if we have a session or if there's an error in the URL
    const error = searchParams.get('error');
    const errorCode = searchParams.get('error_code');

    if (error) {
      setStatus('error');
      setIsVerifying(false);
      return;
    }

    // Check if user is already verified/logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setStatus('success');
      } else {
        // If no session, it might still be pending or failed
        // We'll wait a bit or show a message
        setStatus('pending');
      }
      setIsVerifying(false);
    });
  }, [searchParams]);

  const handleResendEmail = async () => {
      // This usually requires the email, which we might not have here if not logged in
      toast.info("If you haven't received the email, please try signing up again or contact support.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <AuthCard
        title={status === 'success' ? "Email Verified!" : status === 'error' ? "Verification Failed" : "Verify your email"}
        description={
          status === 'success' 
            ? "Your email has been successfully verified. You can now access all features." 
            : status === 'error'
            ? "There was an issue verifying your email. The link may have expired."
            : "We've sent a verification link to your email address. Please click it to continue."
        }
        footer={
          <div className="flex flex-col w-full gap-2">
            {status === 'success' ? (
              <Button asChild className="w-full">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link to="/login">Back to Login</Link>
              </Button>
            )}
          </div>
        }
      >
        <div className="flex flex-col items-center justify-center py-6 text-center">
          {isVerifying ? (
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          ) : status === 'success' ? (
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : status === 'error' ? (
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-2">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ) : (
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-2">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </AuthCard>
    </div>
  );
};

export default VerifyEmailPage;
