<script lang="ts" setup>
// import { createDirectus, staticToken, realtime } from '@directus/sdk';
// const { user } = useDirectusAuth();

const { directus, readMe } = useCMS();
const messageList = ref([]);
const chats = ref<any[]>([]);
const selected_chat = ref<any>();
const selected_chat_users = ref<string>('');
const message_input = ref<string>('');
const send_loading = ref<boolean>(false);
const channelList = useCookie<number[]>('messages:sidebar');
const messageHistory = ref([]);

const { data: user, refresh: refreshUser } = await useAsyncData('AMS:ME', () => directus.request(readMe()), {
  transform: (data) => transformUser(data),
});

async function subscribeChat(event) {
  console.log(unref(user)?.id);
  const { subscription } = await directus.subscribe('chats', {
    event,
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
    directus.sendMessage({
      type: 'items',
      collection: 'chats',
      action: 'read',
      query: {
        limit: -1,
        sort: '-sort_date',
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

function addMessageToList(message) {
  messageHistory.value.push(message);
}

const messageSubmit = (event) => {
  const text = event.target.elements.text.value;

  directus.sendMessage({
    type: 'items',
    collection: 'messages',
    action: 'create',
    data: { text },
  });

  event.target.reset();
};

onMounted(() => {
  const cleanup = directus.onWebSocket('message', function (data) {
    if (data.type == 'auth' && data.status == 'ok') {
      readAllChats();
      subscribeChat('create');
      subscribeChat('update');
      subscribeMessages('create');
    }

    if (data.type == 'items') {
      for (const item of data.data) {
        if (item.hasOwnProperty('messages') && chats.value?.findIndex((e) => e.id === item.id) > -1) {
          chats.value[chats.value?.findIndex((e) => e.id === item.id)] = item;
        }
        if (item.hasOwnProperty('messages') && chats.value?.findIndex((e) => e.id === item.id) === -1) {
          chats.value.push(item);
        }
      }
    }
  });

  directus.connect();
  onBeforeUnmount(cleanup);
});

definePageMeta({
  middleware: 'auth',
  layout: false,
});
</script>

<template>
  <NuxtLayout name="ams" :screen="true" no-padding>
    <div class="lg:w-[calc(100vw_-_18rem_-_7px)] h-full">
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
              <hr class="mt-2 mb-1" />
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
  overflow-y: auto;
}
</style>
