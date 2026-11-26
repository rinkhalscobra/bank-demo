import { useNavigate } from 'react-router-dom';
import { Clock, Shield, CheckCircle, XCircle, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BrandLogo from '../components/ui/BrandLogo';
import { useBranding } from '../contexts/BrandingContext';

export default function KycStatus() {
  const { kycStatus, signOut, refreshKycStatus, user } = useAuth();
  const { branding } = useBranding();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleRefresh = async () => {
    await refreshKycStatus();
  };

  const statusConfig = {
    pending: {
      icon: Clock,
      iconBg: 'bg-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_10%,transparent)]',
      iconColor: 'text-[color:var(--palette-primary,#244A73)]',
      title: 'Verification Required',
      description: 'Please complete the identity verification process to activate your banking account.',
      showKycButton: true,
    },
    submitted: {
      icon: Shield,
      iconBg: 'bg-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_10%,transparent)]',
      iconColor: 'text-[color:var(--palette-primary,#244A73)]',
      title: 'Verification Under Review',
      description: 'Your identity documents have been submitted and are currently being reviewed by our compliance team. This typically takes 1-2 business days.',
      showKycButton: false,
    },
    approved: {
      icon: CheckCircle,
      iconBg: 'bg-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_10%,transparent)]',
      iconColor: 'text-[color:var(--palette-primary,#244A73)]',
      title: 'Verification Approved',
      description: 'Your identity has been verified. You can now access your banking dashboard.',
      showKycButton: false,
    },
    rejected: {
      icon: XCircle,
      iconBg: 'bg-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_10%,transparent)]',
      iconColor: 'text-[color:var(--palette-primary,#244A73)]',
      title: 'Verification Declined',
      description: 'Unfortunately, we were unable to verify your identity. Please resubmit your documents or contact our support team for assistance.',
      showKycButton: true,
    },
  };

  const config = statusConfig[kycStatus || 'pending'];
  const Icon = config.icon;

  return (
    <div className="kyc-shell min-h-screen bg-[color:var(--palette-surface,#F5F8FC)]">
      <div className="site-navbar relative px-4 py-6">
        <div className="site-navbar-accent absolute inset-x-0 top-0 h-1" aria-hidden="true" />
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex flex-col items-start">
            <span className="inline-flex px-3 py-2">
              <BrandLogo
                src={branding.navbarLogoUrl}
                alt={branding.brandName}
                className="h-16 w-auto max-w-[280px] flex-shrink-0 object-contain"
              />
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-white/75 transition-colors hover:text-white"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_14%,transparent)] bg-white p-8 text-center shadow-[0_24px_60px_-48px_color-mix(in_srgb,var(--palette-primary,#244A73)_45%,transparent)]">
          <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${config.iconBg}`}>
            <Icon className={`h-10 w-10 ${config.iconColor}`} />
          </div>

          <h2 className="text-2xl font-serif font-bold text-neutral-900 mb-3">{config.title}</h2>
          <p className="mb-8 leading-relaxed text-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_80%,transparent)]">{config.description}</p>

          {user && (
            <div className="mb-8 rounded-2xl border border-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_14%,transparent)] bg-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_4%,transparent)] p-4 text-left">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_70%,transparent)]">Account</span>
                  <p className="font-medium text-neutral-800">{user.user_metadata?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_70%,transparent)]">Email</span>
                  <p className="truncate font-medium text-neutral-800">{user.email}</p>
                </div>
                <div>
                  <span className="text-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_70%,transparent)]">Status</span>
                  <p className="font-medium capitalize">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_14%,transparent)] bg-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_10%,transparent)] px-2 py-0.5 text-xs font-semibold text-[color:var(--palette-primary,#244A73)]">
                      {kycStatus || 'pending'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {config.showKycButton && (
              <button
                onClick={() => navigate('/kyc')}
                className="w-full rounded-xl bg-[color:var(--palette-primary,#244A73)] py-3 font-semibold text-white transition-colors hover:bg-[color:var(--palette-primary-dark,#12263F)]"
              >
                {kycStatus === 'rejected' ? 'Resubmit Verification' : 'Start Verification'}
              </button>
            )}

            {kycStatus === 'submitted' && (
              <button
                onClick={handleRefresh}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_14%,transparent)] py-3 font-medium text-[color:var(--palette-primary,#244A73)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_4%,transparent)]"
              >
                <RefreshCw className="w-4 h-4" />
                Check Status
              </button>
            )}

            {kycStatus === 'approved' && (
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full rounded-xl bg-[color:var(--palette-primary,#244A73)] py-3 font-semibold text-white transition-colors hover:bg-[color:var(--palette-primary-dark,#12263F)]"
              >
                Go to Dashboard
              </button>
            )}
          </div>
        </div>

        {kycStatus === 'submitted' && (
          <div className="mt-6 rounded-2xl border border-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_14%,transparent)] bg-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_10%,transparent)] p-4 text-sm text-[color:var(--palette-primary,#244A73)]">
            <p className="font-medium mb-1">What happens next?</p>
            <ul className="list-inside list-disc space-y-1 text-[color:color-mix(in_srgb,var(--palette-primary,#244A73)_85%,transparent)]">
              <li>Our compliance team reviews your submitted documents</li>
              <li>You will be notified once the review is complete</li>
              <li>Upon approval, you will have full access to all banking services</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
