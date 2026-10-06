"use client";

import Script from "next/script";
import * as React from "react";
import { useActionState, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login } from "../services/auth-service";
import { loginSchema } from "../schemas/login-schema";
import { type LoginErrors } from "../types";

interface FormFieldProps extends React.ComponentProps<typeof Input> {
  label: string;
  error?: string;
  id: "email" | "password";
}

function useLoginFormLogic() {
  const [serverState, formAction, isPending] = useActionState(login, null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clientErrors, setClientErrors] = useState<LoginErrors>({});

  useEffect(() => {
    if (serverState?.error) {
      toast.error(serverState.error);
    }
  }, [serverState?.error]);

  const validateField = useCallback((field: "email" | "password", value: string) => {
    const schema = field === "email" ? loginSchema.shape.email : loginSchema.shape.password;
    const result = schema.safeParse(value);

    setClientErrors((prev) => {
      const next = { ...prev };
      if (!result.success) {
        next[field] = result.error.flatten().formErrors;
      } else {
        delete next[field];
      }
      return next;
    });
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateField("email", value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    validateField("password", value);
  };

  const effectiveEmail = email || serverState?.email || "";
  const emailError = clientErrors.email?.[0] || serverState?.errors?.email?.[0];
  const passwordError = clientErrors.password?.[0] || serverState?.errors?.password?.[0];

  return {
    formAction,
    isPending,
    values: { email: effectiveEmail, password },
    handlers: { handleEmailChange, handlePasswordChange },
    errors: {
      email: emailError,
      password: passwordError,
      general: serverState?.error,
    },
  };
}

const ValidatedInput = React.memo(({ label, error, className, id, ...props }: FormFieldProps) => (
  <Field>
    <div className="flex items-center">
      <FieldLabel htmlFor={id} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {label} <span className="text-destructive">*</span>
      </FieldLabel>
    </div>
    <Input
      id={id}
      name={id}
      autoComplete={id === "email" ? "username" : "current-password"}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(
        "h-14 bg-muted/50 border-border/60 rounded-2xl sm:rounded-3xl px-5 font-bold tracking-tight text-foreground placeholder:text-muted-foreground focus:bg-background focus-visible:border-primary focus-visible:ring-primary/30 transition-colors shadow-none",
        className
      )}
      {...props}
    />
    {error && (
      <p id={`${id}-error`} className="text-destructive text-xs">
        {error}
      </p>
    )}
  </Field>
));
ValidatedInput.displayName = "ValidatedInput";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { formAction, isPending, values, handlers, errors } = useLoginFormLogic();

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <form action={formAction} className="flex flex-col gap-2" noValidate>
        <FieldGroup className="gap-6">
          <ValidatedInput
            id="email"
            label="Email"
            type="email"
            placeholder="Masukkan email Anda"
            disabled={isPending}
            required
            value={values.email}
            onChange={handlers.handleEmailChange}
            error={errors.email}
          />

          <ValidatedInput
            id="password"
            label="Kata Sandi"
            type="password"
            placeholder="••••••••"
            disabled={isPending}
            required
            value={values.password}
            onChange={handlers.handlePasswordChange}
            error={errors.password}
          />

          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && <>
            <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
            <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} data-theme="auto" />
          </>}
          <Field>
            <Button
              type="submit"
              disabled={isPending}
              className="h-14 w-full bg-primary rounded-2xl sm:rounded-3xl text-white font-black uppercase tracking-widest text-sm hover:bg-primary/90 cursor-pointer shadow-none"
            >
              {isPending ? "Mohon Tunggu..." : "Masuk"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
