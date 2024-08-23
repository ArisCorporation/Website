<script lang="ts" setup>
import { createDirectus, staticToken, realtime } from '@directus/sdk';
const { url } = useDirectus();
const client = useDirectusRealtime();
const { user } = useDirectusAuth();

const messageList = ref();
const chats = ref<any[]>([]);
const selected_chat = ref<any>();
const selected_chat_users = ref<string>('');
const message_input = ref<string>('');
const send_loading = ref<boolean>(false);
const channelList = useCookie<number[]>('messages:sidebar');
// const ws_url = url.origin + '/websocket'
// const access_token = unref(tokens).access_token

// const client = createDirectus(ws_url)
//   .with(staticToken(access_token))
//   .with(realtime());

async function send_message(message: string, chat_id: string) {
  if (!message) return;
  send_loading.value = true;
  await client.sendMessage({
    type: 'items',
    collection: 'messages',
    action: 'create',
    data: {
      text: message,
      chat: chat_id,
    },
  });
  send_loading.value = false;
  const index = chats.value?.findIndex((c) => c.id === chat_id);
  chats.value[index].messages.push({
    text: message,
    user_created: unref(user),
  });
  message_input.value = '';
}

async function subscribe() {
  await client.subscribe('chats', {
    event: 'create',
    query: {
      limit: -1,
      sort: '-sort_date',
      fields: ['*', '*.*.*', 'users.user_id.*'],
      filter: { users: { user_id: { _eq: unref(user)?.id } } },
      deep: {
        messages: {
          _sort: ['date_created'],
        },
      },
    },
  });
  await client.subscribe('chats', {
    event: 'update',
    query: {
      limit: -1,
      sort: '-sort_date',
      fields: ['*', '*.*.*', 'users.user_id.*'],
      filter: { users: { user_id: { _eq: unref(user)?.id } } },
      deep: {
        messages: {
          _sort: ['date_created'],
        },
      },
    },
  });
  await client.subscribe('messages', {
    event: 'create',
    query: {
      limit: -1,
      sort: '-date_created',
      fields: ['*', '*.*.*.*'],
      filter: { chat: { users: { user_id: { _eq: unref(user)?.id } } } },
      deep: {
        chat: {
          messages: {
            _sort: ['date_created'],
          },
        },
      },
    },
  });
  await client.subscribe('messages', {
    event: 'update',
    query: {
      limit: -1,
      sort: '-date_created',
      fields: ['*', '*.*.*.*'],
      filter: { chat: { users: { user_id: { _eq: unref(user)?.id } } } },
      deep: {
        chat: {
          messages: {
            _sort: ['date_created'],
          },
        },
      },
    },
  });
}

async function readAllChats() {
  const test = await client.sendMessage({
    type: 'items',
    collection: 'chats',
    action: 'read',
    query: {
      limit: -1,
      sort: '-sort_date',
      fields: ['*', '*.*.*', 'users.user_id.*'],
      filter: { users: { user_id: { _eq: unref(user)?.id } } },
      deep: {
        messages: {
          _sort: ['date_created'],
        },
      },
    },
  });

  console.log('test', test);
}

client.onWebSocket('open', function () {
  console.log({ event: 'onopen' });
});

client.onWebSocket('message', function (message) {
  const { type, status, data, event } = message;
  // console.log({ event: 'onmessage', message });

  if (type === 'ping') {
    client.sendMessage({
      type: 'pong',
    });
  }

  if (type === 'auth' && status === 'ok') {
    subscribe();
    readAllChats();
    // console.log('subscription started');
  }

  if (chats.value?.length === 0) {
    if (type === 'items') {
      chats.value = data;
    }
  }

  if (type === 'subscription') {
    if (event === 'create') {
      if (data[0].messages || data[0].users) {
        // console.log('new chat created!', [...unref(chats), ...data]);
      }
      if (data[0].chat) {
        // console.log('new message created', data[0].chat);
        const index = chats.value?.findIndex((chat) => chat.id === data[0].chat?.id);
        chats.value[index] = data[0].chat;
      }
    }
    if (event === 'update') {
      if (data[0].messages || data[0].users) {
        // console.log('chat updated');
        data.map((chat) => {
          const index = chats.value?.findIndex((c) => c.id === chat.id);
          chats.value[index] = chat;
        });
      }
      if (data[0].chat) {
        // console.log('message updated');
        data.map((message) => {
          const chatToUpdate = chats.value?.find((chat) => chat.id === message.chat);
          if (chatToUpdate) {
            chatToUpdate.messages = unref(chats)
              ?.find((chat) => chat?.id === message.chat)
              ?.messages?.map((m) => (m?.id === message.id ? message : m));
          }
        });
      }
    }
  }
});

client.onWebSocket('close', function () {
  // console.log({ event: 'onclose' });
});

client.onWebSocket('error', function (error) {
  // console.log({ event: 'onerror', error });
});

function scrollChatToBottom() {
  messageList.value.scrollTop = messageList.value.scrollHeight;
}

watch(
  [chats, selected_chat],
  () => {
    nextTick(() => {
      scrollChatToBottom();
    });
  },
  { deep: true },
);
watch(selected_chat, () => {
  selected_chat_users.value = chats.value
    .find((e) => e.id === selected_chat.value)
    ?.users?.map((obj) => transformUser(obj.user_id).full_name)
    .join(', ');
});

onMounted(async () => {
  await client.connect();
});

onBeforeUnmount(() => {
  client.disconnect();
});

definePageMeta({
  middleware: 'auth',
  layout: false,
});
</script>

<template>
  <NuxtLayout name="ams" :screen="true" no-padding>
    <div class="lg:w-[calc(100vw_-_16rem_-_7px)] h-full">
      <SplitterGroup
        id="group-1"
        direction="horizontal"
        class="border border-bsecondary"
        @layout="channelList = $event"
      >
        <SplitterPanel id="group-1-panel-1" :default-size="channelList[0]" :min-size="20" class="h-full max-h-full">
          <div class="flex flex-col flex-1 h-full max-w-full max-h-full overflow-y-auto overflow-x-clip">
            <div
              v-for="chat in chats"
              :key="chat.id"
              :class="[
                chat.id === selected_chat
                  ? 'bg-aris-400/20 border-l-aris-400'
                  : 'border-aris-400/0 hover:bg-aris-400/10 hover:border-l-aris-400/25',
              ]"
              class="max-w-full p-2 py-3 border-b border-l cursor-pointer border-b-bsecondary"
              @click="() => (selected_chat = chat.id)"
            >
              <p class="p-0 overflow-x-hidden whitespace-nowrap text-ellipsis">
                {{ chat?.users?.map((obj) => transformUser(obj.user_id).full_name).join(', ') }}
              </p>
              <p class="p-0 -mt-1 overflow-hidden text-sm max-h-10 text-ellipsis text-tbase/50">
                {{ chat?.messages[chat?.messages.length - 1]?.text.replace(/<[^>]+>/g, '') }}
              </p>
            </div>
          </div>
        </SplitterPanel>
        <SplitterResizeHandle id="group-1-resize-1" class="w-0.5 relative h-full bg-btertiary">
          <div class="absolute top-0 bottom-0 flex w-4 h-5 mx-auto my-auto rounded bg-btertiary -left-2 -right-2">
            <UIcon name="i-radix-icons-drag-handle-dots-2" class="size-5" />
          </div>
        </SplitterResizeHandle>
        <SplitterPanel id="group-1-panel-2" :default-size="channelList[1]" :min-size="33">
          <div
            v-if="selected_chat"
            ref="messageList"
            class="relative flex flex-col flex-1 h-full max-w-full max-h-full overflow-y-auto overflow-x-clip"
          >
            <div class="sticky top-0 z-10 border-b border-b-btertiary bg-bprimary">
              <UInput v-model="selected_chat_users" size="xs" />
            </div>
            <div
              v-for="message in chats.find((e) => e.id === selected_chat)?.messages"
              :key="message.id"
              class="flex flex-col max-w-full px-4 mt-4 list-none"
            >
              <div
                class="relative p-2 rounded-2xl bg-bsecondary min-w-[66%] xl:min-w-[33%]"
                :class="[message.user_created.id === user.id ? 'ml-auto' : 'mr-auto']"
              >
                <div class="flex">
                  <UAvatar :src="$config.public.fileBase + message.user_created.avatar" alt="Avatar" />
                  <span class="my-auto ml-2 text-sm">{{ transformUser(message.user_created)?.full_name }}</span>
                </div>
                <span class="break-all whitespace-pre-wrap" v-html="message.text" />
                <span class="flex w-full pt-1 text-xs border-t border-t-btertiary">
                  <UIcon
                    v-if="!message.date_created"
                    name="i-svg-spinners-3-dots-scale"
                    class="my-auto ml-auto size-[16px]"
                  />
                  <span v-else class="mt-auto ml-auto text-xs text-tbase/75">
                    {{
                      new Date(message.date_created).getDate() !== new Date().getDate()
                        ? new Date(message.date_created).toLocaleDateString() + ' '
                        : ''
                    }}
                    {{ new Date(message.date_created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                    Uhr
                  </span>
                </span>
              </div>
            </div>
            <div class="sticky bottom-0 mt-auto bg-bprimary">
              <hr class="mt-2 mb-1" >
              <!-- <div class="max-h-[204px] overflow-y-auto"> -->
                <Editor v-model="message_input" messenger-mode @send="() => send_message(message_input, selected_chat)" />
              <!-- </div> -->
            </div>
          </div>
          <div class="flex size-full">
            <UIcon name="i-heroicons-inbox" class="m-auto size-24" />
          </div>
        </SplitterPanel>
      </SplitterGroup>
    </div>
    <!-- <div
      class="relative flex items-stretch w-full h-full max-w-full max-h-full grid-cols-3 divide-x-2 overflow-clip divide-bsecondary"
    >
      <div class="h-full w-[300px] overflow-y-auto">
        <h1 class="text-center">Chats</h1>
        <h3 class="opacity-0">.</h3>
        <hr class="mr-auto w-[calc(100%_-_16px)] bg-bsecondary" />
        <ul>
          <li
            v-for="chat in chats"
            :key="chat.id"
            :class="{ 'bg-bsecondary': chat.id === selected_chat }"
            class="pr-4 overflow-hidden text-ellipsis whitespace-nowrap"
            @click="() => (selected_chat = chat.id)"
          >
            {{ chat?.users?.map((obj) => transformUser(obj.user_id).full_name).join(', ') }}
            <br />
            {{ selected_chat }}
          </li>
        </ul>
      </div>
      <div
        class="relative flex flex-col items-stretch flex-1 flex-shrink-0 h-full max-w-full max-h-full col-span-2 overflow-y-auto"
      >
        <div>
          <h1 class="text-center">Messages</h1>
          <h3 class="text-center">
            Chat from:
            {{
              chats
                .find((e: any) => e.id === selected_chat)
                ?.users?.map((obj) => transformUser(obj.user_id).full_name)
                .join(', ')
            }}
          </h3>
          <hr class="ml-auto w-[calc(100%_-_16px)] bg-bsecondary" />
        </div>
        <ul ref="messageList" class="flex flex-col flex-1 max-w-full overflow-y-auto overflow-x-clip">
          <li
            v-for="message in chats.find((e) => e.id === selected_chat)?.messages"
            :key="message.id"
            class="flex flex-col max-w-full px-4 mt-4 list-none"
          >
            <div
              v-if="message.user_created.id === user.id"
              class="relative p-2 ml-auto rounded-2xl bg-bsecondary min-w-[66%] xl:min-w-[33%] divide-y divide-btertiary"
            >
              <div class="flex">
                <UAvatar :src="$config.public.fileBase + message.user_created.avatar" alt="Avatar" />
                <span class="my-auto ml-2 text-sm">{{ transformUser(message.user_created)?.full_name }}</span>
              </div>
              <span class="break-all whitespace-pre-wrap" v-html="message.text" />
              <span class="flex w-full pt-1 text-xs">
                <span class="mt-auto ml-auto text-xs text-tbase/75"
                  >{{
                    new Date(message.date_created).getDate() !== new Date().getDate()
                      ? new Date(message.date_created).toLocaleDateString() + ' '
                      : ''
                  }}
                  {{ new Date(message.date_created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  Uhr
                </span>
              </span>
            </div>
            <div
              v-else
              class="relative p-2 mr-auto rounded-2xl bg-bsecondary min-w-[66%] xl:min-w-[33%] divide-y divide-btertiary"
            >
              <div class="flex">
                <UAvatar
                  :src="$config.public.fileBase + message.user_created.avatar"
                  :alt="transformUser(message.user_created)?.full_name?.toUpperCase()"
                />
                <span class="my-auto ml-2 text-sm">{{ transformUser(message.user_created)?.full_name }}</span>
              </div>
              <span class="break-all whitespace-pre-wrap" v-html="message.text" />
              <span class="flex w-full pt-1 text-xs">
                <span class="mt-auto ml-auto text-xs text-tbase/75"
                  >{{
                    new Date(message.date_created).getDate() !== new Date().getDate()
                      ? new Date(message.date_created).toLocaleDateString() + ' '
                      : ''
                  }}
                  {{ new Date(message.date_created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  Uhr
                </span>
              </span>
            </div>
          </li>
        </ul>
        <div class="mt-auto mb-0">
          <Editor v-model="message_input" />
          <UButton :loading="send_loading" @click="() => send_message(message_input, selected_chat)">send</UButton>
        </div>
      </div>
    </div> -->
  </NuxtLayout>
</template>

<style>
.ProseMirror {
  height: 130px !important;
  overflow-y: auto
}
</style>