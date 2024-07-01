<script setup lang="ts">
const props = defineProps<{ editor: any }>()

function setLink() {
	const previousUrl = unref(props.editor)?.getAttributes('link').href
	const url = window.prompt('URL', previousUrl)

	// cancelled
	if (url === null) {
		return
	}

	// empty
	if (url === '') {
		unref(props.editor)?.chain().focus().extendMarkRange('link').unsetLink().run()

		return
	}

	// update link
	unref(props.editor)?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}
</script>

<template>
	<UButton
		icon="i-fa6-solid-link"
		size="xs"
		:variant="editor?.isActive('link') ? 'solid' : 'ghost'"
		:color="editor?.isActive('link') ? 'primary' : 'white'"
		@click="setLink"
	/>
</template>
