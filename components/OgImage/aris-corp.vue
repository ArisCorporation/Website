<script lang="ts" setup>
/**
 * @credits Pergel <https://nuxtlabs.com/>
 * @see https://github.com/nuxt/nuxt.com/blob/main/components/OgImage/OgImageDocs.vue
 */
import { computed } from 'vue';

const props = withDefaults(defineProps<{ title?: string; description?: string; headline?: string }>(), {
  title: 'title',
  description: 'description',
  headline: 'headline',
});

const title = computed(() => props.title.slice(0, 60));
</script>

<template>
  <div class="w-full h-full flex flex-col justify-center bg-[#212121] relative">
    <svg
      class="absolute top-0 right-0"
      width="1200"
      height="675"
      viewBox="0 0 1200 675"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g style="mix-blend-mode: overlay" opacity="0.7" filter="url(#filter0_f_448_25)">
        <!-- <circle cx="901.5" cy="45.5" r="199.5" fill="#FFA7A7" />
        <circle cx="600.5" cy="216.5" r="199.5" fill="#FFCC49" />
        <circle cx="179.5" cy="317.5" r="199.5" fill="#FFA149" /> -->
        <circle cx="901.5" cy="45.5" r="199.5" fill="#81fff7" />
        <circle cx="600.5" cy="216.5" r="199.5" fill="#00ffe8" />
        <circle cx="179.5" cy="317.5" r="199.5" fill="#00b7ac" />
      </g>
      <defs>
        <filter
          id="filter0_f_448_25"
          x="-240"
          y="-374"
          width="1561"
          height="1111"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="110" result="effect1_foregroundBlur_448_25" />
        </filter>
      </defs>
    </svg>

    <div class="w-[600px] pl-[100px]">
      <p v-if="headline" class="uppercase text-[24px] text-aris-300 mb-4 font-semibold">ArisCorp - Biografie</p>
      <h1 class="w-[600px] m-0 text-[75px] font-semibold mb-4 text-white flex items-center">
        <span>{{ title }}</span>
      </h1>
      <p class="text-[32px] text-[#E4E4E7] leading-tight">
        {{ description.slice(0, 120) + '...' }}
      </p>
    </div>

    <svg
      class="absolute right-[64px]"
      width="371"
      height="234"
      viewBox="0 0 371 234"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M214.438 208.586L196.985 176.565L170.426 197.912L178.014 208.586H214.438Z"
        fill="#FAFAFA"
        stroke="#FAFAFA"
        stroke-width="0.104076"
      />
      <path
        d="M8.78453 228.392L6.21411 223.835L364.688 55.3414L8.81176 228.4C8.80187 228.405 8.78993 228.402 8.78453 228.392Z"
        fill="#00FFE8"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M5 220.785L111.237 5.78467L171.185 117.859L362.411 54.579L5 220.785ZM76.3305 153.693L110.478 72.877L138.555 129.295L76.3305 153.693Z"
        fill="#F8F8F8"
      />
      <path d="M173.006 114.81L358.617 54.5791L169.333 108.71L173.006 114.81Z" fill="#00FFE8" />
      <g filter="url(#filter0_f_1_29)">
        <path
          d="M214.751 208.274L197.298 176.253L170.738 197.6L178.327 208.274H214.751Z"
          fill="#FAFAFA"
          stroke="#FAFAFA"
          stroke-width="0.104076"
        />
        <path
          d="M9.09679 228.08L6.52637 223.522L365 55.0292L9.12402 228.088C9.11412 228.093 9.10219 228.089 9.09679 228.08Z"
          fill="#00FFE8"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M5.31226 220.473L111.549 5.47241L171.497 117.547L362.724 54.2668L5.31226 220.473ZM76.6428 153.38L110.79 72.5647L138.867 128.983L76.6428 153.38Z"
          fill="#F8F8F8"
        />
        <path d="M173.318 114.497L358.929 54.2668L169.646 108.398L173.318 114.497Z" fill="#00FFE8" />
      </g>
      <defs>
        <filter
          id="filter0_f_1_29"
          x="0.108438"
          y="0.268595"
          width="370.095"
          height="233.026"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="2.60191" result="effect1_foregroundBlur_1_29" />
        </filter>
      </defs>
    </svg>

    <!-- <svg
      class="absolute right-[64px]"
      width="527"
      height="332"
      viewBox="0 0 527 332"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M304.868 296.281L280.046 250.74L242.272 281.101L253.065 296.281H304.868Z"
        fill="#FAFAFA"
        stroke="#FAFAFA"
        stroke-width="0.14802"
      />
      <path
        d="M12.3825 324.449L8.72681 317.968L518.556 78.333L12.4212 324.461C12.4072 324.468 12.3902 324.463 12.3825 324.449Z"
        fill="#00FFE8"
      />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7 313.63L158.092 7.85217L243.352 167.247L515.318 77.2486L7 313.63ZM108.448 218.21L157.013 103.272L196.945 183.512L108.448 218.21Z"
        fill="#F8F8F8"
      />
      <path d="M245.942 162.91L509.922 77.2487L240.719 154.235L245.942 162.91Z" fill="#00FFE8" />
      <g filter="url(#filter0_f_1_29)">
        <path
          d="M305.312 295.837L280.49 250.296L242.717 280.657L253.509 295.837H305.312Z"
          fill="#FAFAFA"
          stroke="#FAFAFA"
          stroke-width="0.14802"
        />
        <path
          d="M12.8266 324.005L9.1709 317.523L519 77.8887L12.8653 324.017C12.8513 324.024 12.8343 324.019 12.8266 324.005Z"
          fill="#00FFE8"
        />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M7.44409 313.186L158.537 7.40808L243.796 166.803L515.762 76.8045L7.44409 313.186ZM108.892 217.766L157.457 102.828L197.389 183.068L108.892 217.766Z"
          fill="#F8F8F8"
        />
        <path d="M246.386 162.466L510.366 76.8046L241.163 153.791L246.386 162.466Z" fill="#00FFE8" />
      </g>
      <defs>
        <filter
          id="filter0_f_1_29"
          x="0.043107"
          y="0.00709629"
          width="526.358"
          height="331.414"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="3.70049" result="effect1_foregroundBlur_1_29" />
        </filter>
      </defs>
    </svg> -->

    <!-- <svg
      class="absolute top-[250px] right-[190px]"
      width="241"
      height="184"
      viewBox="0 0 241 184"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_ddd_563_6)">
        <path
          d="M204.852 126.822C204.852 127.098 204.677 128.114 202.583 129.748C200.551 131.335 197.276 133.034 192.613 134.687C183.325 137.979 169.872 140.62 153.875 142.19C137.92 143.755 120.334 144.166 103.363 143.367C86.3776 142.566 70.8801 140.594 58.8213 137.738C52.7901 136.31 47.8449 134.713 44.0617 133.037C40.1988 131.325 37.891 129.679 36.7621 128.335C36.2309 127.702 36.0703 127.267 36.0227 127.035C35.9829 126.842 35.9842 126.629 36.1192 126.305C36.459 125.488 37.6413 124.038 40.7165 122.28C46.7614 118.823 57.5073 115.641 71.9244 113.359C86.2251 111.096 103.109 109.879 120.426 109.879"
          stroke="url(#paint0_angular_563_6)"
          stroke-width="8"
        />
      </g>
      <g clip-path="url(#clip0_563_6)">
        <g filter="url(#filter1_i_563_6)">
          <path
            d="M211.514 112.29L209.41 124.066L200.573 115.781L182.897 61.0337C186.772 60.5223 190.442 59.2291 193.777 57.2455L211.514 112.29ZM196.523 35.7822C195.733 40.2018 193.22 44.1268 189.537 46.6936C185.853 49.2604 181.301 50.2588 176.881 49.4691L174.437 49.0324L131.693 103.474L120.534 108.187L122.638 96.4106L165.598 41.721C160.708 33.7969 163.149 23.3421 171.139 18.407C174.615 16.2766 178.781 15.416 182.836 16.1405L184.821 5.03095C186.294 5.29416 187.603 6.13183 188.458 7.35968C189.314 8.58752 189.647 10.105 189.383 11.5782L188.212 18.1328C194.461 21.6568 197.783 28.7276 196.523 35.7822ZM185.413 33.7973C185.677 32.3241 185.344 30.8066 184.488 29.5788C183.633 28.3509 182.324 27.5133 180.851 27.25C179.378 26.9868 177.861 27.3196 176.633 28.1752C175.405 29.0308 174.567 30.3391 174.304 31.8123C174.041 33.2856 174.374 34.803 175.229 36.0308C176.085 37.2587 177.393 38.0964 178.866 38.3596C180.339 38.6228 181.857 38.29 183.085 37.4344C184.313 36.5788 185.15 35.2705 185.413 33.7973Z"
            fill="url(#paint1_diamond_563_6)"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_ddd_563_6"
          x="-3.8147e-05"
          y="77.8786"
          width="240.852"
          height="105.886"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="3.62319" />
          <feGaussianBlur stdDeviation="7.24638" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.667391 0 0 0 0 0.3625 0 0 0 0.75 0" />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_563_6" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="16" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 0.854792 0 0 0 0 0.4875 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="effect1_dropShadow_563_6" result="effect2_dropShadow_563_6" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="effect2_dropShadow_563_6" result="effect3_dropShadow_563_6" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect3_dropShadow_563_6" result="shape" />
        </filter>
        <filter
          id="filter1_i_563_6"
          x="120.534"
          y="5.03094"
          width="94.9804"
          height="123.035"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="7" dy="5" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow_563_6" />
        </filter>
        <radialGradient
          id="paint0_angular_563_6"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(120.426 126.822) rotate(90) scale(20.943 88.4261)"
        >
          <stop offset="0.0677083" stop-color="#FFE092" />
          <stop offset="0.333333" stop-color="#FFD792" />
          <stop offset="0.666667" stop-color="#FFD192" />
          <stop offset="1" stop-color="#FFAC5F" />
        </radialGradient>
        <radialGradient
          id="paint1_diamond_563_6"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(303.899 145.741) rotate(-155.036) scale(253.361 239.508)"
        >
          <stop offset="0.333674" stop-color="#FEC479" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </radialGradient>
        <clipPath id="clip0_563_6">
          <rect width="135.426" height="135.426" fill="white" transform="translate(96.5743)" />
        </clipPath>
      </defs>
    </svg> -->
  </div>
</template>
