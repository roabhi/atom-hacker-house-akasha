'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Atom, ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { validateCode, markCodeAsUsed } from '@/lib/validation'
import { sendTokens, validateAddress } from '@/lib/cosmos'

const formSchema = z.object({
  code: z.string().length(7, 'Code must be exactly 7 characters'),
  address: z
    .string()
    .min(1, 'Address is required')
    .regex(/^neutron[a-zA-Z0-9]{39}$/, 'Invalid Neutron address format'),
})

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
  })

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true)

      // const isValidCode = validateCode(data.code)
      // if (!isValidCode) {
      //   toast.error('Invalid or already used code')
      //   return
      // }

      // if (!(await validateAddress(data.address))) {
      //   toast.error('Invalid Neutron address or address not found on chain')
      //   return
      // }

      const hash = await sendTokens(data.address)
      if (hash) {
        // await markCodeAsUsed(data.code)
        setTxHash(hash)
        setShowSuccessDialog(true)
        toast.success('Tokens sent successfully!')
        reset()
      }
    } catch (error) {
      console.error('Transaction error:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Transaction failed. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="flex items-center space-x-3">
            <Atom className="w-12 h-12 text-purple-500" />
            <h1 className="text-4xl font-bold text-white">Neutron Faucet</h1>
          </div>

          <Card className="w-full max-w-md p-6 bg-neutral-800 border-neutral-700">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-200">
                  Redemption Code
                </label>
                <Input
                  {...register('code')}
                  className="bg-neutral-900 border-neutral-700 text-white"
                  placeholder="Enter your 7-digit code"
                />
                {errors.code && (
                  <p className="text-red-500 text-sm">
                    {errors.code.message?.toString()}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-200">
                  Neutron Address
                </label>
                <Input
                  {...register('address')}
                  className="bg-neutral-900 border-neutral-700 text-white"
                  placeholder="neutron..."
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">
                    {errors.address.message?.toString()}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  'Processing...'
                ) : (
                  <>
                    Redeem Tokens
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Card>

          <div className="max-w-2xl text-center space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Welcome to the Neutron Ecosystem
            </h2>
            <p className="text-neutral-400">
              Get started with 0.01 NTRN testnet tokens by redeeming your code.
              These tokens will help you explore and interact with the Neutron
              network&tilde;s features and applications.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="text-green-500 w-5 h-5" />
                <span className="text-neutral-300">Fast Distribution</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="text-green-500 w-5 h-5" />
                <span className="text-neutral-300">Testnet Tokens</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="text-green-500 w-5 h-5" />
                <span className="text-neutral-300">Easy to Use</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-neutral-800 text-white border-neutral-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="text-green-500 w-6 h-6" />
              Transaction Successful!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-neutral-300">
              Your tokens have been sent successfully! You can view the
              transaction details below.
            </p>
            <div className="bg-neutral-900 p-4 rounded-lg">
              <p className="text-sm text-neutral-300 mb-2">Transaction Hash:</p>
              <a
                href={`https://explorer.neutron.org/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 break-all flex items-center gap-2"
              >
                {txHash}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={() => setShowSuccessDialog(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
