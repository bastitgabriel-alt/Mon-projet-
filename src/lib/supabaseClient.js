import { createClient } from '@supabase/supabase-js'

// Clé "publishable" : conçue pour être exposée côté client, protégée par les
// policies RLS définies en base (chaque élève ne peut lire/écrire que ses
// propres lignes). Pas de clé secrète ici.
const supabaseUrl = 'https://vgornmsdsfqactxaoieu.supabase.co'
const supabaseKey = 'sb_publishable_SRfVmTnp7HksNyNv4OknKA_FRSIZH_-'

export const supabase = createClient(supabaseUrl, supabaseKey)
