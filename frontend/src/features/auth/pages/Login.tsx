import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { useForm } from "react-hook-form"
import { useState } from "react"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useLogin } from "../hooks/useLogin"

const userSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string(),
})

type User = z.infer<typeof userSchema>

export function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(userSchema),
  })

  const { login, isPending } = useLogin()

  const [loginError, setLoginError] = useState<string | null>(null)

  async function onSubmit(data: User) {
    console.log(data)
    setLoginError(null)

    try {
      await login(data)
    } catch {
      setLoginError(
        "Unable to sign in. Please check your credentials or try again."
      )
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/70 shadow-xl shadow-black/10">
        <CardHeader className="space-y-5 pb-6">
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-2 text-white">
              <img
                src="/logo-light.svg"
                alt="Apex"
                className="size-7 shrink-0 dark:hidden"
              />

              <img
                src="/logo.svg"
                alt="Apex"
                className="hidden size-7 shrink-0 dark:block"
              />
            </div>

            <span className="text-xl font-bold tracking-tight">APEX</span>
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              Welcome back.
            </CardTitle>
            <CardDescription>
              Sign in to continue to your workspace.
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-5">
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-11"
                {...register("email")}
                aria-invalid={!!errors.email}
              />

              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>

                <a
                  href="/forgot-password"
                  className="text-sm text-emerald-600 hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <Input
                id="password"
                type="password"
                className="h-11"
                {...register("password")}
                aria-invalid={!!errors.password}
              />

              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4 pt-5">
            {loginError && (
              <p className="text-sm text-destructive" role="alert">
                {loginError}
              </p>
            )}
            <Button
              type="submit"
              className="h-11 w-full bg-emerald-700 hover:bg-emerald-800"
              disabled={isPending}
            >
              {isPending ? "Signing in..." : "Sign in to Apex"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Protected access · Apex Field Operations
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default Login
