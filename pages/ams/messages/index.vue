<script lang="ts" setup>
// import { createDirectus, staticToken, realtime } from '@directus/sdk';
// const { user } = useDirectusAuth();

const { directus, readMe } = useCMS();
const messageList = ref();
const chats = ref<any[]>([]);
const selected_chat = ref<any>();
const selected_chat_users = ref<string>('');
const chat_input = ref<string>('');
const send_loading = ref<boolean>(false);
// const channelList = useCookie<number[]>('messages:sidebar');
const layout = useCookie<number[]>('splitter:layout');
const messageHistory = ref([]);

const { data: user, refresh: refreshUser } = await useAsyncData('AMS:RAW_ME', () => directus.request(readMe()));

async function subscribeChat(event) {
  console.log(unref(user)?.id);
  const { subscription } = await directus.subscribe('chats', {
    event,
    query: {
      limit: -1,
      sort: ['-messages.date_created', '-sort_date'],
      fields: ['*', '*.*.*', 'users.user_id.*'],
      filter: { users: { user_id: { _eq: unref(user)?.id } } },
      deep: {
        messages: {
          _sort: ['date_created'],
        },
      },
    },
  });

  for await (const message of subscription) {
    console.log('receiveChat', message);
    receiveChat(message);
  }
}
async function subscribeMessages(event) {
  console.log(unref(user)?.id);
  const { subscription } = await directus.subscribe('messages', {
    event,
    query: {
      limit: -1,
      sort: '-date_created',
      fields: ['*', '*.*.*'],
      filter: { chat: { users: { user_id: { _eq: unref(user)?.id } } } },
    },
  });

  for await (const message of subscription) {
    console.log('receiveMessage', message);
    receiveMessage(message);
  }
}

function readAllChats() {
  directus.sendMessage({
    type: 'items',
    collection: 'chats',
    action: 'read',
    query: {
      limit: -1,
      sort: ['-messages.date_created', '-sort_date'],
      fields: ['*', '*.*.*', 'users.user_id.*'],
      filter: { users: { user_id: { _eq: unref(user)?.id } } },
      deep: {
        messages: {
          _sort: ['date_created'],
        },
      },
    },
  });
}

function receiveChat(data) {
  if (data.type == 'subscription' && data.event == 'init') {
    console.log('subscription started');
  }
  if (data.type == 'subscription' && data.event == 'create') {
    // addMessageToList(message.data[0]);
  }
  if (data.type == 'subscription' && data.event == 'update') {
    console.log('message.data');
    console.log(data);
  }
}
async function receiveMessage(data) {
  if (data.type == 'subscription' && data.event == 'init') {
    console.log('subscription started');
  }
  if (data.type == 'subscription' && data.event == 'create') {
    console.log('recievechat', data);
    directus.sendMessage({
      type: 'items',
      collection: 'chats',
      action: 'read',
      query: {
        limit: -1,
        sort: ['-messages.date_created', '-sort_date'],
        fields: ['*', '*.*.*', 'users.user_id.*'],
        filter: { id: { _eq: data.data[0].chat.id } },
        deep: {
          messages: {
            _sort: ['date_created'],
          },
        },
      },
    });
  }
  if (data.type == 'subscription' && data.event == 'update') {
    console.log('message.data');
    console.log(data);
  }
}

async function send_message(message: string, chat_id: string) {
  if (!message) return;
  send_loading.value = true;
  await directus.sendMessage({
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
  chat_input.value = '';
}

function handleItem(item) {
  if (item.hasOwnProperty('messages') && chats.value?.findIndex((e) => e.id === item.id) > -1) {
    console.log('replace', item);
    chats.value[chats.value?.findIndex((e) => e.id === item.id)] = item;
  }
  if (item.hasOwnProperty('messages') && chats.value?.findIndex((e) => e.id === item.id) === -1) {
    chats.value.push(item);
  }
}

onMounted(() => {
  const cleanup = directus.onWebSocket('message', function (data) {
    if (data.type == 'auth' && data.status == 'ok') {
      readAllChats();
      subscribeChat('create');
      subscribeChat('update');
      subscribeMessages('create');
    }

    if (data.type == 'items') {
      if (Array.isArray(data.data)) {
        for (const item of data.data) {
          handleItem(item);
        }
      } else {
        handleItem(data.data);
      }
    }
  });

  directus.connect();
  onBeforeUnmount(cleanup);
});

function scrollChatToBottom() {
  messageList.value.scrollTop = messageList.value.scrollHeight;
}

watch(
  chats,
  () => {
    console.log('dsa');
    chats.value.sort((a, b) => {
      return (
        new Date(b.messages[b.messages.length - 1].date_created).getTime() -
        new Date(a.messages[a.messages.length - 1].date_created).getTime()
      );
    });
  },
  { deep: true },
);
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

definePageMeta({
  middleware: 'auth',
  layout: false,
});
</script>

<template>
  <NuxtLayout name="ams" :screen="true" no-padding>
    <div class="h-[calc(100vh_-_25px)]">
      <SplitterGroup
        id="group-1"
        direction="horizontal"
        class="border rounded-lg border-bg-600"
        @layout="layout = $event"
      >
        <SplitterPanel id="group-1-panel-1" :default-size="layout[0]" :min-size="20" class="h-full">
          <div class="flex items-center flex-shrink-0 h-16 min-w-0 px-4 border-b border-bg-600 gap-x-4">
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
                        background: 'bg-bg-600',
                        marker: {
                          background: 'bg-bg-800',
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
          <div class="flex flex-col flex-1 p-0 overflow-y-auto border-l border-bg-600">
            <div v-for="(chat, index) in chats" :key="chat.id">
              <div
                class="p-4 text-sm border-l-2 cursor-pointer text-tbase"
                :class="[
                  selected_chat?.id === chat?.id
                    ? 'bg-aris-900/25 border-aris-400'
                    : 'hover:border-aris-400/25 hover:bg-aris-900/10 border-transparent',
                ]"
                @click="() => (selected_chat = chat.id)"
              >
                <div class="flex items-center justify-between">
                  <div class="relative flex items-stretch min-w-0 gap-3 overflow-hidden">
                    <span
                      class="relative truncate"
                      :class="[index === 1 || selected_chat?.id === chat?.id ? 'text-white' : 'text-light-gray']"
                      >{{
                        [
                          ...chat.users
                            .map((chat_user: any) =>
                              chat_user.user_id.id !== user.id ? transformUser(chat_user.user_id).full_name : null,
                            )
                            .filter((e) => e),
                          transformUser(user).full_name,
                        ].join(', ')
                      }}
                      <div v-if="index === 1" class="inline-flex ml-1">
                        <div class="my-auto rounded-full size-2 bg-aris-400" />
                      </div>
                    </span>
                  </div>
                  <span class="pl-2 min-w-fit">
                    {{
                      new Date(chat.messages[chat.messages.length - 1].date_created).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: 'short',
                      })
                    }}
                    {{
                      new Date(chat.messages[chat.messages.length - 1].date_created).toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    }}
                  </span>
                </div>
                <!-- <p class="p-0">Meeting Schedule</p> -->
                <p class="p-0 text-dark-gray line-clamp-1">
                  {{
                    chat.messages[chat.messages.length - 1].text.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]*>?/gm, '')
                  }}
                </p>
              </div>
              <div class="flex flex-row items-center w-full text-center align-center">
                <div class="flex w-full border-t border-solid border-bg-600" />
              </div>
            </div>
          </div>
        </SplitterPanel>
        <SplitterResizeHandle id="group-1-resize-1" class="w-0.5 relative bg-bg-400">
          <div class="absolute top-0 bottom-0 flex w-4 h-5 mx-auto my-auto rounded bg-bg-400 -left-2 -right-2">
            <UIcon name="i-radix-icons-drag-handle-dots-2" class="size-5" />
          </div>
        </SplitterResizeHandle>
        <SplitterPanel
          id="group-1-panel-2"
          :default-size="layout[1]"
          :min-size="33"
          class="relative flex-col items-stretch flex-1 hidden w-full lg:flex"
        >
          <div v-if="!selected_chat" class="items-center justify-center flex-1 hidden lg:flex">
            <UIcon name="i-heroicons-inbox" class="size-32" />
          </div>
          <template v-else>
            <!-- <div class="sticky top-0 z-10 border-b border-b-btertiary bg-bg-800">
            <UInput v-model="selected_chat_users" size="xs" />
          </div> -->
            <!-- <div class="flex flex-row items-center w-full my-5 text-center align-center">
            <div class="flex w-full border-t border-solid border-bg-600" />
          </div> -->
            <div
              v-if="selected_chat"
              ref="messageList"
              class="relative flex flex-col flex-1 h-full max-w-full max-h-full overflow-y-auto overflow-x-clip"
            >
              <div class="sticky top-0 z-10 border-b border-b-btertiary bg-bg-800">
                <UInput v-model="selected_chat_users" size="xs" />
              </div>
              <div
                v-for="message in chats.find((e) => e.id === selected_chat)?.messages"
                :key="message.id"
                class="flex flex-col max-w-full px-4 mt-4 list-none"
              >
                <div
                  class="relative p-2 rounded-2xl bg-bg-600 min-w-[66%] xl:min-w-[33%]"
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
                      {{
                        new Date(message.date_created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      }}
                      Uhr
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <!-- <div class="flex-1 overflow-y-auto">
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
                  model-value="
                    <p>
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
                <div class="flex w-full border-t border-solid border-bg-600" />
              </div>
            </div>
          </div> -->
            <div class="flex flex-row items-center w-full my-5 text-center align-center">
              <div class="flex w-full border-t border-solid border-bg-600" />
            </div>
            <div class="h-48 mx-4 mb-5 border rounded-md overflow-y-clip border-bg-600">
              <Editor
                v-model="chat_input"
                simple-mode
                :loading="send_loading"
                @send="() => send_message(chat_input, selected_chat)"
              />
              <!-- <UButton icon="i-heroicons-paper-airplane" color="white" resize class="absolute bottom-6 right-10"
              >Submit</UButton
            > -->
            </div>
          </template>
        </SplitterPanel>
      </SplitterGroup>
    </div>
    <!-- <div
      class="relative flex items-stretch w-full h-full max-w-full max-h-full grid-cols-3 divide-x-2 overflow-clip divide-bg-600"
    >
      <div class="h-full w-[300px] overflow-y-auto">
        <h1 class="text-center">Chats</h1>
        <h3 class="opacity-0">.</h3>
        <hr class="mr-auto w-[calc(100%_-_16px)] bg-bg-600" />
        <ul>
          <li
            v-for="chat in chats"
            :key="chat.id"
            :class="{ 'bg-bg-600': chat.id === selected_chat }"
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
          <hr class="ml-auto w-[calc(100%_-_16px)] bg-bg-600" />
        </div>
        <ul ref="messageList" class="flex flex-col flex-1 max-w-full overflow-y-auto overflow-x-clip">
          <li
            v-for="message in chats.find((e) => e.id === selected_chat)?.messages"
            :key="message.id"
            class="flex flex-col max-w-full px-4 mt-4 list-none"
          >
            <div
              v-if="message.user_created.id === user.id"
              class="relative p-2 ml-auto rounded-2xl bg-bg-600 min-w-[66%] xl:min-w-[33%] divide-y divide-btertiary"
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
              class="relative p-2 mr-auto rounded-2xl bg-bg-600 min-w-[66%] xl:min-w-[33%] divide-y divide-btertiary"
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

<!-- <style>
.ProseMirror {
  height: 130px !important;
  overflow-y: auto;
}
</style> -->
