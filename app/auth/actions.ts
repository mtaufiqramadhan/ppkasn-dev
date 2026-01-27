'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { loginSchema } from './schema'

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const rawData = {
        email: formData.get('email'),
        password: formData.get('password'),
    }

    const validatedFields = loginSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            error: 'Invalid inputs. Please check your email and password.',
            email: rawData.email as string,
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { email, password } = validatedFields.data

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('Login error:', error)
        return {
            error: error.message || 'Could not authenticate user',
            email,
        }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/auth')
}
