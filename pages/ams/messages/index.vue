<script setup lang="ts">
import cheerio from 'cheerio';
import { TiptapArisCorpPanel, TiptapArisCorpPanelWithBg, TiptapVideo } from '~/composables/tiptapExt';
const config = useRuntimeConfig();
const { tokens } = useDirectusTokens();
const { user: me } = useDirectusAuth();

const connection = new WebSocket(config.public.directus.url.replace('https', 'wss') + '/websocket');
const chatHistory = ref([]);
const layout = useCookie<number[]>('splitter:layout');
const selectedChat = ref();
const chat_input = ref('');

connection.addEventListener('open', function () {
  console.log({ event: 'onopen' });

  connection.send(
    JSON.stringify({
      type: 'auth',
      access_token: tokens.value.access_token,
    }),
  );
});

connection.addEventListener('message', function (message) {
  const data = JSON.parse(message.data);
  console.log({ event: 'onmessage', data });

  if (data.type === 'auth' && data.status === 'ok') {
    // readAllChats(); // Not needed because all chats are in the subscription message
    subscribe_chats();
  }

  if (data?.data[0]?.hasOwnProperty('users')) {
    if (data.type === 'items') {
      for (const item of data.data) {
        addChatToList(item);
      }
    }

    if (data.type === 'subscription' && data.event === 'init') {
      console.log('subscription started');
      for (const item of data.data) {
        addChatToList(item);
      }
    }
    if (data.type === 'subscription' && data.event === 'create') {
      addChatToList(data.data[0]);
    }
  }
});

connection.addEventListener('close', function () {
  console.log({ event: 'onclose' });
});

connection.addEventListener('error', function (error) {
  console.log({ event: 'onerror', error });
});

function addChatToList(chat) {
  chatHistory.value.push(chat);
  chatHistory.value.sort((a, b) => new Date(b.sort_date) - new Date(a.sort_date));
}

function readAllChats() {
  connection.send(
    JSON.stringify({
      type: 'items',
      collection: 'chats',
      action: 'read',
      query: {
        limit: -1,
        sort: ['-sort_date'],
        fields: ['*', '*.*', 'users.user_id.*'],
        filter: { users: { user_id: { id: { _eq: me.value?.id } } } },
      },
    }),
  );
}

function subscribe_chats(event: string) {
  connection.send(
    JSON.stringify({
      type: 'subscribe',
      collection: 'chats',
      action: event,
      query: {
        limit: -1,
        sort: ['-sort_date'],
        fields: ['*', '*.*', 'users.user_id.*'],
        filter: { users: { user_id: { id: { _eq: me.value?.id } } } },
      },
    }),
  );
}

const chatCreate = (users_list: string[]) => {
  const users = {
    create: users_list.map((id: string) => ({
      chat_id: '+',
      user_id: { id },
    })),
  };

  client.sendMessage({
    type: 'items',
    collection: 'messages',
    action: 'create',
    data: { users },
  });
};

function selectChat(chat) {
  selectedChat.value = chat;
}

onBeforeUnmount(async () => {
  await connection.close();
});

definePageMeta({
  middleware: 'auth',
  layout: 'ams',
});
</script>

<template>
  <SplitterGroup
    direction="horizontal"
    class="min-h-[calc(100vh_-_25px)] border border-bsecondary rounded-lg"
    @layout="layout = $event"
  >
    <SplitterPanel :min-size="25" :max-size="50" :default-size="33" class="h-full">
      <div class="flex items-center flex-shrink-0 h-16 min-w-0 px-4 border-b border-bsecondary gap-x-4">
        <div class="flex items-center justify-between flex-1 gap-x-1.5 min-w-0">
          <div class="flex items-stretch min-w-0 gap-1.5">
            <h1 class="flex items-center gap-1.5 text-white min-w-0 m-0 text-base">
              <span class="truncate">Posteingang</span>
            </h1>
            <UBadge color="primary" variant="subtle">1</UBadge>
          </div>
          <div class="flex items-stretch flex-shrink-0 gap-1.5 w-fit h-8">
            <div>
              <UTabs
                :items="[
                  {
                    label: 'Alle',
                  },
                  {
                    label: 'Ungelesen',
                  },
                ]"
                :ui="{
                  list: {
                    height: 'h-8',
                    background: 'bg-bsecondary',
                    marker: {
                      background: 'bg-bprimary',
                    },
                    tab: {
                      height: 'h-6',
                      padding: 'px-2',
                      size: 'text-xs',
                    },
                  },
                }"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col flex-1 p-0 overflow-y-auto border-l border-bsecondary">
        <div v-for="(chat, index) in chatHistory" :key="chat.id">
          <div
            class="p-4 text-sm border-l-2 cursor-pointer text-tbase"
            :class="[
              selectedChat?.id === chat?.id
                ? 'bg-aris-900/25 border-aris-400'
                : 'hover:border-aris-400/25 hover:bg-aris-900/10 border-transparent',
            ]"
            @click="selectChat(chat)"
          >
            <div class="flex items-center justify-between">
              <div class="relative flex items-stretch min-w-0 gap-3 overflow-hidden">
                <span
                  class="relative truncate"
                  :class="[index === 1 || selectedChat?.id === chat?.id ? 'text-white' : 'text-light-gray']"
                  >{{
                    chat.users
                      .map((user: any) => (user.user_id.id !== me.id ? transformUser(user.user_id).full_name : null))
                      .filter((e) => e)
                      .join(', ')
                  }}
                  <div v-if="index === 1" class="inline-flex ml-1">
                    <div class="my-auto rounded-full size-2 bg-aris-400" />
                  </div>
                </span>
              </div>
              <span class="min-w-fit">
                {{ new Date(chat.date_updated).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' }) }}
              </span>
            </div>
            <!-- <p class="p-0">Meeting Schedule</p> -->
            <p class="p-0 text-dark-gray line-clamp-1">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquet orci accumsan himenaeos eleifend sed
              sociosqu venenatis posuere interdum blandit integer duis. Iaculis scelerisque nec ad ipsum sollicitudin
              leo ligula consectetur fringilla nulla nulla cubilia.
            </p>
          </div>
          <div class="flex flex-row items-center w-full text-center align-center">
            <div class="flex w-full border-t border-solid border-bsecondary" />
          </div>
        </div>
      </div>
    </SplitterPanel>
    <SplitterResizeHandle class="w-px bg-bsecondary" />
    <SplitterPanel class="relative flex-col items-stretch flex-1 hidden w-full lg:flex">
      <div v-if="!selectedChat" class="items-center justify-center flex-1 hidden lg:flex">
        <UIcon name="i-heroicons-inbox" class="size-32" />
      </div>
      <div v-else class="flex flex-col flex-1 py-4 overflow-y-auto">
        <div class="flex flex-row items-center w-full my-5 text-center align-center">
          <div class="flex w-full border-t border-solid border-bsecondary" />
        </div>
        <div class="flex-1">
          <div>
            <div
              class="p-4 text-sm border-l-2 border-transparent cursor-pointer text-tbase hover:border-aris-400/25 hover:bg-aris-900/10"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-stretch min-w-0 gap-3">
                  <NuxtImg src="33133d2a-85db-41e5-9216-670bbc4d0256" width="64px" height="64px" class="rounded" />
                  <div>
                    <span class="flex items-center truncate gap-x-2">
                      Thomas Blakeney <span class="text-xs text-dark-gray">@thomas.blakeney</span>
                      <span class="text-xs text-dark-gray">20:04</span>
                    </span>
                    <p class="p-0 text-xs text-dark-gray">Verwaltung</p>
                    <p class="p-0 text-xs text-dark-gray">Logistik (Abteilungsleiter)</p>
                  </div>
                </div>
                <span class="min-w-fit"> Date </span>
              </div>
              <Editor
                model-value="<p>
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquet orci accumsan
  himenaeos eleifend sed sociosqu venenatis posuere interdum blandit integer
  duis. Iaculis scelerisque nec ad ipsum sollicitudin leo ligula consectetur
  fringilla nulla nulla cubilia.
</p>
<p>
  Lorem ultrices eget quam cum sagittis hendrerit parturient vulputate potenti
  eros tempor risus. Ullamcorper proin porttitor etiam egestas cubilia gravida
  duis netus velit dui dui vel. Maecenas cras urna eleifend condimentum duis per
  luctus montes elit diam sollicitudin cras.
</p>
"
                read-only
              />
            </div>
            <div class="flex flex-row items-center w-full text-center align-center">
              <div class="flex w-full border-t border-solid border-bsecondary" />
            </div>
          </div>
        </div>
        <div class="flex flex-row items-center w-full my-5 text-center align-center">
          <div class="flex w-full border-t border-solid border-bsecondary" />
        </div>
        <div class="h-32 mx-4 overflow-y-auto border rounded-md border-bsecondary">
          <Editor :model-value="chat_input" simple-mode />
          <UButton icon="i-heroicons-paper-airplane" color="white" resize class="absolute bottom-6 right-10"
            >Submit</UButton
          >
        </div>
      </div>
    </SplitterPanel>
  </SplitterGroup>
</template>

<style scoped>
html {
  --width: v-bind(messagesWidth);
}
</style>
