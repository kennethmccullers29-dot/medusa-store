"use client"
import { RadioGroup } from "@headlessui/react"
import { isStripeLike, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { CheckCircleSolid, CreditCard } from "@medusajs/icons"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer, {
  StripePaymentContainer,
} from "@modules/checkout/components/payment-container"
import { StripeContext } from "@modules/checkout/components/payment-wrapper/stripe-wrapper"
import Divider from "@modules/common/components/divider"
import {
  Button,
  Container,
  Heading,
  Text,
  clx,
} from "@modules/common/components/ui"
import { HttpTypes } from "@medusajs/types"
import { useElements } from "@stripe/react-stripe-js"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useContext, useEffect, useRef, useState } from "react"

const stripeKeyConfigured = Boolean(
  process.env.NEXT_PUBLIC_STRIPE_KEY ||
    process.env.NEXT_PUBLIC_MEDUSA_PAYMENTS_PUBLISHABLE_KEY
)

const StripeContinueButton = ({
  disabled,
  onContinue,
  setError,
}: {
  disabled: boolean
  onContinue: () => void
  setError: (error: string | null) => void
}) => {
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)

  const handleContinue = async () => {
    if (!elements) return
    setSubmitting(true)
    const { error } = await elements.submit()
    setSubmitting(false)
    if (error) {
      setError(error.message ?? "Please check your payment details.")
      return
    }
    setError(null)
    onContinue()
  }

  return (
    <Button
      size="large"
      className="mt-6"
      onClick={handleContinue}
      isLoading={submitting}
      disabled={disabled || !elements}
      data-testid="submit-payment-button"
    >
      Continue to review
    </Button>
  )
}

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: HttpTypes.StoreCart
  availablePaymentMethods: { id: string }[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession) => paymentSession.status === "pending"
  )
  const stripeMethod = availablePaymentMethods.find((method) =>
    isStripeLike(method.id)
  )
  const otherMethods = availablePaymentMethods.filter(
    (method) => !isStripeLike(method.id)
  )
  const stripeReady = useContext(StripeContext)
  const initializingSession = useRef<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? stripeMethod?.id ?? otherMethods[0]?.id ?? ""
  )

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "payment"

  const setPaymentMethod = (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    setPaymentComplete(false)
  }

  useEffect(() => {
    if (
      !isOpen ||
      !stripeKeyConfigured ||
      !isStripeLike(selectedPaymentMethod) ||
      activeSession?.provider_id === selectedPaymentMethod ||
      initializingSession.current === selectedPaymentMethod
    ) {
      return
    }

    initializingSession.current = selectedPaymentMethod
    setIsLoading(true)
    initiatePaymentSession(cart, { provider_id: selectedPaymentMethod })
      .then(() => router.refresh())
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err))
        initializingSession.current = null
      })
      .finally(() => setIsLoading(false))
  }, [activeSession?.provider_id, cart, isOpen, router, selectedPaymentMethod])

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards && ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])?.length > 0 && cart?.total === 0
  )

  const paymentReady =
    (activeSession && (cart?.shipping_methods?.length ?? 0) !== 0) || paidByGiftcard

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  const handleEdit = () => {
    router.push(pathname + "?" + createQueryString("step", "payment"), {
      scroll: false,
    })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      if (activeSession?.provider_id !== selectedPaymentMethod) {
        await initiatePaymentSession(cart, {
          provider_id: selectedPaymentMethod,
        })
        router.refresh()
      }
      router.push(pathname + "?" + createQueryString("step", "review"), {
        scroll: false,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row items-center gap-2 font-heading text-2xl leading-snug text-homestead-forest",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          Payment
          {!isOpen && paymentReady && <CheckCircleSolid />}
        </Heading>
        {!isOpen && paymentReady && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-sm font-medium text-homestead-olive underline-offset-2 hover:underline"
              data-testid="edit-payment-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      <div>
        <div className={isOpen ? "block" : "hidden"}>
          {!paidByGiftcard && availablePaymentMethods?.length > 0 && (
            <>
              {stripeMethod && otherMethods.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod(stripeMethod.id)}
                  className="mb-3 block text-sm font-medium text-homestead-forest underline-offset-4 hover:underline"
                >
                  Pay with Stripe
                </button>
              )}
              {selectedPaymentMethod === stripeMethod?.id && (
                <div>
                  <Text className="mb-3 text-base font-medium text-homestead-forest">
                    Secure payment
                  </Text>
                  {stripeKeyConfigured ? (
                    <StripePaymentContainer
                      setError={setError}
                      setPaymentComplete={setPaymentComplete}
                    />
                  ) : (
                    <p role="alert" className="text-sm text-red-700">
                      Card payments are temporarily unavailable. Please try again later.
                    </p>
                  )}
                </div>
              )}
              {otherMethods.length > 0 && (
                <RadioGroup
                  value={selectedPaymentMethod}
                  onChange={(value: string) => setPaymentMethod(value)}
                >
                {otherMethods.map((paymentMethod) => (
                  <div key={paymentMethod.id}>
                    <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                      />
                  </div>
                ))}
                </RadioGroup>
              )}
            </>
          )}

          {paidByGiftcard && (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          )}

          <ErrorMessage
            error={error}
            data-testid="payment-method-error-message"
          />

          {isStripeLike(selectedPaymentMethod) ? (
            stripeReady && activeSession?.provider_id === selectedPaymentMethod ? (
              <StripeContinueButton
                disabled={!paymentComplete || isLoading}
                onContinue={() => router.push(pathname + "?" + createQueryString("step", "review"), { scroll: false })}
                setError={setError}
              />
            ) : null
          ) : (
            <Button
            size="large"
            className="mt-6"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!selectedPaymentMethod && !paidByGiftcard}
            data-testid="submit-payment-button"
          >
            Continue to review
          </Button>
          )}
        </div>

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Payment method
                </Text>
                <Text
                  className="txt-medium text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id]?.title ||
                    activeSession?.provider_id}
                </Text>
              </div>
              <div className="flex flex-col w-1/3">
                <Text className="txt-medium-plus text-ui-fg-base mb-1">
                  Payment details
                </Text>
                <div
                  className="flex gap-2 txt-medium text-ui-fg-subtle items-center"
                  data-testid="payment-details-summary"
                >
                  <Container className="flex items-center h-7 w-fit p-2 bg-ui-button-neutral-hover">
                    {paymentInfoMap[selectedPaymentMethod]?.icon || (
                      <CreditCard />
                    )}
                  </Container>
                  <Text>Secure payment details saved for this checkout</Text>
                </div>
              </div>
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-1/3">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                Payment method
              </Text>
              <Text
                className="txt-medium text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </Text>
            </div>
          ) : null}
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default Payment
