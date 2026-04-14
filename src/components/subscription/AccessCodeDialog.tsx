import React, { useState } from 'react';
import { HeroUIProvider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from '@heroui/react';
import { TicketIcon, Loader2, ArrowRight } from 'lucide-react';
import { SubscriptionApi } from '@/api/subscription';

interface AccessCodeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (planName: string, trialDays: number) => void;
}

export function AccessCodeDialog({ isOpen, onOpenChange, onSuccess }: AccessCodeDialogProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRedeem = async () => {
    if (!code.trim()) {
      setError('Please enter a valid access code.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Redeem code & get trial info
      const redeemRes = await SubscriptionApi.redeemAccessCode(code);
      if (!redeemRes.valid || !redeemRes.couponId || !redeemRes.linkedPlanId || !redeemRes.trialDays) {
        throw new Error(redeemRes.message || 'Invalid access code.');
      }

      // 2. Setup subscription via Razorpay
      const subRes = await SubscriptionApi.createTrialSubscription({
        couponId: redeemRes.couponId,
        linkedPlanId: redeemRes.linkedPlanId,
        trialDays: redeemRes.trialDays,
      });

      // 3. Open Razorpay checkout
      const options = {
        key: subRes.razorpayKey,
        subscription_id: subRes.subscriptionId,
        name: 'AI Interview Prep',
        description: `${subRes.planName} - ${subRes.trialDays} Days Free Trial`,
        handler: async (response: any) => {
          try {
            setLoading(true);
            await SubscriptionApi.verifyTrialSubscription({
              razorpaySubscriptionId: response.razorpay_subscription_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              couponId: redeemRes.couponId!,
              linkedPlanId: redeemRes.linkedPlanId!,
              trialDays: redeemRes.trialDays!,
            });

            onSuccess(subRes.planName, subRes.trialDays!);
            onOpenChange(false);
            setCode('');
          } catch (err: any) {
            setError(err.message || 'Verification failed. Please try again.');
          } finally {
            setLoading(false);
          }
        },
        theme: {
          color: '#6c63ff'
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (err: any) {
      setError(err.message || 'Failed to redeem access code.');
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange}
      backdrop="blur"
      placement="center"
      className="dark"
      classNames={{
        base: "bg-[#0b0c10] border border-[#1f2937] shadow-2xl",
        header: "border-b border-[#1f2937]",
        footer: "border-t border-[#1f2937]",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-white">
              <div className="flex items-center gap-2">
                <TicketIcon className="w-5 h-5 text-indigo-400" />
                Redeem Access Code
              </div>
            </ModalHeader>
            <ModalBody className="py-6">
              <p className="text-gray-400 text-sm mb-2">
                Have an access code from an event or partner? Redeem it here to start your free trial and unlock all premium features.
              </p>
              
              <Input
                autoFocus
                placeholder="Enter your given access code..."
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRedeem();
                }}
                classNames={{
                  input: "text-lg tracking-wider font-mono uppercase",
                  inputWrapper: "bg-[#1f2937] border border-[#374151] hover:border-indigo-500 transition-colors",
                }}
                disabled={loading}
              />
              
              {error && (
                <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="mt-2 text-xs text-gray-500">
                You'll be asked to add a payment method for validation, but you won't be charged anything today.
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                variant="light" 
                onPress={onClose}
                className="text-gray-400 hover:text-white"
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleRedeem}
                isDisabled={!code.trim() || loading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Redeem Code <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
