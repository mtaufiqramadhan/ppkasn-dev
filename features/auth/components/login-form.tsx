"use client";

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
      <FieldLabel htmlFor={id} className="text-zinc-200">
        {label} <span className="text-red-500">*</span>
      </FieldLabel>
    </div>
    <Input
      id={id}
      name={id}
      className={cn(
        "bg-zinc-900/50 border-zinc-700 rounded-3xl py-5 text-white placeholder:text-zinc-500 focus-visible:ring-zinc-500 shadow-none",
        className
      )}
      {...props}
    />
    {error && (
      <p className="text-red-500 text-xs">
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
        <FieldGroup>
          <ValidatedInput
            id="email"
            label="Email"
            type="email"
            required
            value={values.email}
            onChange={handlers.handleEmailChange}
            error={errors.email}
          />

          <ValidatedInput
            id="password"
            label="Password"
            type="password"
            required
            value={values.password}
            onChange={handlers.handlePasswordChange}
            error={errors.password}
          />

          <Field>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary rounded-3xl text-black hover:bg-primary/90 cursor-pointer py-6 shadow-none"
            >
              {isPending ? "Please wait..." : "Login"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
