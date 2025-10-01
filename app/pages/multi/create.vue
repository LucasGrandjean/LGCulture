<template>
	<NuxtLayout name="selection" :previous="{ icon: 'lucide:chevron-left', button: { variant: 'outline' }, to: '/multi' }">
		<SelectionCard v-for="status in statuses" :key="status.title" :title="status.title" :description="status.description" @click="createLobby(status.value)">
			<template #img>
				<Icon :name="status.icon" class="h-32 text-8xl" />
			</template>
		</SelectionCard>
	</NuxtLayout>
</template>

<script lang="ts" setup>
import { toast } from "vue-sonner"
const supabase = getSupabaseClient()
const { getPlayer } = usePlayerStore()

definePageMeta({
  title: "Multijoueurs - Création d'un salon",
})

const statuses = [
  {
    title: "Public",
    value: "public",
    icon: "lucide:globe",
    description: "Le lobby sera accessible depuis la liste des serveurs",
  },
  {
    title: "Privé",
    value: "private",
    icon: "lucide:lock",
    description: "Le lobby ne sera accessible que par un code d'invite",
  },
]

async function createLobby(status: string) {
  // get logged in user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    toast.error(`Erreur`, {
		description: 'Vous devez être connecté pour lancer une partie',
	})
	return
  }

  // OPTION 1: if you store roles in a `profiles` table
  const { data: profile, error: profileError } = await supabase
    .from('players')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error(profileError)
    toast.error(`Erreur`, {
		description: 'Impossible de vérifier les permissions',
	})
	return
  }

  if (profile?.role !== 'admin') {
    toast.error(`Erreur`, {
		description: 'Vous devez être Lucas Grandjean pour lancer un lobby',
	})
	return
  }

  // Only runs if admin
  const { data, error } = await supabase
    .from("lobbies")
    .insert([
      {
        title: `Partie de ${getPlayer.username}`,
        is_public: status === "public",
      },
    ])
    .select()
    .single()

  if (error) {
    console.error(error)
    toast.error(`Erreur`, {
		description: 'Echec de la création du lobby',
	})
	return
  } else if (data) {
    await navigateTo(`/multi/${data.id}`)
  }
}
</script>