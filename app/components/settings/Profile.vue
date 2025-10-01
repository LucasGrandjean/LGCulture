<template>
	<form class="space-y-8" @submit="onSubmit">
		<FormField name="avatar">
			<FormItem class="flex w-fit items-center gap-4">
				<FormControl>
					<Avatar shape="circle" size="base">
						<AvatarImage :src="values.avatar || ''" alt="avatar" />
						<AvatarFallback />
					</Avatar>
					<Dialog>
						<DialogTrigger as-child>
							<Button type="button" variant="outline">
								Personnaliser
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Personnaliser votre avatar</DialogTitle>
								<DialogDescription>
									Cette section est encore en construction
								</DialogDescription>
							</DialogHeader>
							<ToggleGroup :model-value="selectedAvatarSeed" type="single" class="grid grid-cols-2 gap-3 p-6 sm:grid-cols-5 sm:gap-6 sm:p-0" @update:model-value="(seed) => { if (seed) selectedAvatarSeed = seed as string }">
								<div v-for="seed in seeds" :key="seed">
									<ToggleGroupItem :value="seed" class="flex aspect-square size-full items-center justify-center rounded-full p-2 ring-primary transition-colors duration-75 hover:bg-inherit data-[state=on]:ring-3">
										<Avatar shape="circle" size="base">
											<AvatarImage :src="createAvatar(bigEars, { seed: seed }).toDataUri()" alt="avatar" />
										</Avatar>
									</ToggleGroupItem>
								</div>
							</ToggleGroup>
							<DialogFooter>
								<DialogClose as-child>
									<Button type="button" @click="setFieldValue('avatar', `https://api.dicebear.com/6.x/big-ears/svg?seed=${selectedAvatarSeed}`)">
										Valider
									</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</FormControl>
				<FormMessage />
			</FormItem>
		</FormField>
		<div class="flex max-w-xs gap-0">
			<FormField v-slot="{ componentField }" name="username" class="w-full flex-1">
				<FormItem class="z-10 w-full flex-1">
					<FormLabel>Nom d'utilisateur</FormLabel>
					<FormControl class="w-full flex-1">
						<Input
							id="username"
							class="w-full flex-1 rounded-r-none"
							placeholder="Username"
							type="text"
							v-bind="componentField"
						/>
					</FormControl>
					<FormDescription>
						Sera visible par les autres joueurs
					</FormDescription>
					<FormMessage />
				</FormItem>
			</FormField>

			<FormField v-slot="{ componentField }" name="usertag">
				<FormItem class="focus-within:z-10 flex flex-col">
					<FormLabel class="invisible">Tag</FormLabel>
					<FormControl class="relative w-full max-w-20 items-center">
						<div>
							<Input id="tag" v-bind="componentField" type="text" maxlength="4" class="relative rounded-l-none border-l-0 pl-7 uppercase tracking-widest" />
							<span class="absolute inset-y-0 start-0 flex items-center justify-center ps-2">
								<Icon name="heroicons:hashtag" class="size-4 text-muted-foreground" />
							</span>
						</div>
					</FormControl>
					<FormMessage />
				</FormItem>
			</FormField>
		</div>
		<FormField v-slot="{ componentField }" name="language">
			<FormItem>
				<FormLabel>
					Langue
				</FormLabel>
				<Select v-bind="componentField">
					<FormControl class="w-fit min-w-32 max-w-64">
						<SelectTrigger>
							<SelectValue placeholder="Sélectionnez une langue" />
						</SelectTrigger>
					</FormControl>
					<SelectContent>
						<SelectGroup>
							<SelectItem v-for="language in languages" :key="language.label" :value="language.value">
								{{ language.label }}
							</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
				<FormMessage />
				<FormDescription>Langue des questions posées</FormDescription>
			</FormItem>
		</FormField>

		<FormField name="categories">
			<FormItem class="flex flex-col">
				<FormLabel>Catégories</FormLabel>
				<Popover>
					<PopoverTrigger as-child>
						<FormControl>
							<Button variant="outline" role="combobox" class="w-fit min-w-48 justify-between font-normal text-muted-foreground">
								<template v-if="values?.categories || values?.categories?.length === 0">
									<template v-if="values?.categories?.length > 3">
										{{ values?.categories?.length }} catégories sélectionnées
									</template>
									<template v-else>
										<Badge v-for="category in values?.categories" :key="category">
											{{ categoryList.find((c) => c.value === category)?.title }}
										</Badge>
									</template>
								</template>
								<template v-else>
									Aucune catégories selectionnées
								</template>
								<Icon name="lucide:chevrons-up-down" class="ml-2 size-4 shrink-0 opacity-50" />
							</Button>
						</FormControl>
					</PopoverTrigger>
					<PopoverContent class="w-[200px] p-0">
						<Command>
							<CommandInput placeholder="Search language..." />
							<CommandEmpty>Rien n'a été trouvé.</CommandEmpty>
							<CommandList>
								<CommandGroup>
									<CommandItem
										v-for="category in categoryList"
										:key="category.value"
										:value="category.value"
										class="transition-colors duration-150 ease-out"
										:class="{ 'rounded-none bg-emerald-400/17': values?.categories?.includes(category.value) }"
										@select="() => {
											setFieldValue('categories', values.categories?.includes(category.value)
												? values.categories?.filter((c) => c !== category.value)
												: [...(values?.categories || []), category.value])
										}"
									>
										<Icon :name="values?.categories?.includes(category.value) ? 'lucide:check' : category.icon" class="mr-2 size-4" />
										{{ category.title }}
									</CommandItem>
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
				<FormDescription>
					L'ensemble des catégories dont les questions seront posées
				</FormDescription>
				<FormMessage />
			</FormItem>
		</FormField>

		<Button type="submit">
			Sauvegarder
		</Button>
	</form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod"
import * as z from "zod"
import { useForm } from "vee-validate"
import { createAvatar } from "@dicebear/core"
import { bigEars } from "@dicebear/collection"
import { toast } from "vue-sonner"
import { usePlayerStore } from "~/stores/Player"

const { getPlayer, updatePlayer } = usePlayerStore()

const profileFormSchema = toTypedSchema(z.object({
	username: z.string().min(2).max(50).nonempty(),
	usertag: z.string().min(0),
	language: z.string(),
	avatar: z.string().optional(),
	categories: z.array(z.string()).default([]),
}))

const seeds = ["Avery", "Mason", "George", "Liam", "Riley", "Oliver", "Amaya", "Sadie", "Mackenzie", "Eden", "Jack", "Eliza", "Adrian", "Jocelyn", "Katherine", "Luis"]
const selectedAvatarSeed = ref<string>("")
const { handleSubmit, setFieldValue, values, resetForm } = useForm({
	validationSchema: profileFormSchema,
	initialValues: {
		username: "",
		usertag: "",
		language: "",
		avatar: "",
		categories: [],
	},
})

// Quand le joueur est disponible, remplir le formulaire
watch(getPlayer, (p) => {
  if (!p) return
  resetForm({
    values: {
      username: p.username || "",
      usertag: p.usertag || "",
      language: p.language || "",
      avatar: p.avatar || "",
      categories: p.categories || [],
    },
  })
}, { immediate: true })

const onSubmit = handleSubmit(async (values) => {
	await updatePlayer({
		username: values.username,
		usertag: values.usertag,
		language: values.language,
		avatar: values.avatar,
		categories: values.categories,
	}).then(() => {
		toast.success("Profil mis à jour", {
			description: `Vous avez mis à jour votre profil`,
		})
	}).catch((error) => {
		if (error) {
			if (error.code === "P0001") {
				toast.error("Nom d'utilisateur indisponible", {
					description: `Le nom d'utilisateur ${values.username} avec le tag #${values.usertag} est indisponible`,
				})
			}
			else {
				toast.error(`Erreur ${error.code}`, {
					description: error.details || error.message,
				})
			}
		}
	},
	)
})

const languages = [
	{ value: "en", label: "English" },
	{ value: "fr", label: "Français" },
	{ value: "es", label: "Español" },
	{ value: "it", label: "Italiano" },
	{ value: "de", label: "Deutsch" },
	{ value: "nl", label: "Nederlands" },
]

const categoryList = [
	{
		title: "Lucas",
		descriton: "Oui c moi",
		value: "lucas",
		icon: "lucide:paw-print",
	},
]
</script>
