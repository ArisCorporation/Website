<script setup lang="ts">
const props = defineProps({
  username: {
    type: String,
    required: false,
    default: 'Max Mustermann',
  },
  token: {
    type: String,
    required: false,
    default: '1234567890',
  },
  datetime: {
    type: String,
    required: false,
    default: '2024-05-08T23:35:12+02:00',
  },
});

const requestDate = new Date(props.datetime);
const expireDate = new Date(props.datetime);
expireDate.setHours(expireDate.getHours() + 24);
</script>

<template>
  <ETailwind>
    <EHtml>
      <EHead>
        <EFont
          font-family="Nasalization"
          fallback-font-family="Helvetica"
          :web-font="{
            url: 'https://cms.ariscorp.de/assets/0d4228c9-07eb-4815-a897-70064880a405.woff',
            format: 'woff',
          }"
          :font-weight="400"
          font-style="normal"
        />
      </EHead>
      <EBody class="bg-[#111] text-[#d1d5dd]">
        <EContainer class="border border-solid border-[#222] p-[20px] md:p-7 rounded my-[40px] mx-auto max-w-[465px]">
          <ESection class="mt-[12px]">
            <EImg
              src="cb368123-74a3-4021-bb70-2fffbcdd05fa"
              width="64"
              height="64"
              alt="ArisCorp"
              class="mx-auto my-0"
            />
          </ESection>
          <EHeading class="text-[24px] font-normal text-center p-0 my-[30px] mx-0">
            <strong>Passwort zurücksetzen</strong>
          </EHeading>
          <ESection>
            <EText class="text-[14px] leading-[24px] text-white"> Hallo {{ username }}, </EText>
            <EText class="text-[14px] leading-[24px]">
              Du hast eine Anfrage zum <strong>Zurücksetzen deines Passworts</strong> gestellt.
            </EText>
            <EText> Klicke auf den untenstehenden Button, um dein Passwort zurückzusetzen. </EText>
          </ESection>
          <ESection class="text-center my-[24px]">
            <EButton
              px="20"
              py="12"
              class="bg-[#00ffe8] rounded-lg text-black text-[12px] font-semibold no-underline text-center"
              :href="'https://ariscorp.de/ams/reset-password?token=' + token"
            >
              Passwort zurücksetzen
            </EButton>
          </ESection>
          <ESection>
            <EText class="text-[14px] leading-[24px]">
              Oder kopiere und füge die folgende URL in deinen Browser ein:
              <br />
              <ELink
                :href="'https://ariscorp.de/ams/reset-password?token=' + token"
                class="text-[#e48632] no-underline"
              >
                {{ 'https://ariscorp.de/ams/reset-password?token=' + token }}
              </ELink>
            </EText>
          </ESection>
          <ESection>
            <EText class="text-[14px] leading-[24px]">
              <strong class="text-white">Wichtig:</strong> Der Link ist nur für 24 Stunden gültig.
              <br />
              <span>
                Die Anfrage wurde am
                <strong class="text-white">
                  {{ requestDate.toLocaleDateString('de-DE') }} um {{ requestDate.toLocaleTimeString('de-DE') }} Uhr
                </strong>
                gestellt und läuft am
                <strong class="text-white">
                  {{ expireDate.toLocaleDateString('de-DE') }} um {{ expireDate.toLocaleTimeString('de-DE') }} Uhr
                </strong>
                ab.
              </span>
            </EText>
          </ESection>
          <EHr class="border border-solid border-[#222] my-[16px] mx-0 w-full" />
          <ESection>
            <EText class="text-[#6f6f6f] text-[12px] leading-[24px]">
              <span>Dieser Link ist nur für dich bestimmt und sollte nicht geteilt werden.</span>
              <br />
              <span>
                Falls du nicht um das Zurücksetzen deines Passworts gebeten hast, kannst du diese E-Mail ignorieren.
              </span>
            </EText>
          </ESection>
        </EContainer>
      </EBody>
    </EHtml>
  </ETailwind>
</template>
