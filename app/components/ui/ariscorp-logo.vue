<script lang="ts" setup>
const props = defineProps<{ hover?: boolean }>()
</script>
<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="4096"
    height="4096"
    viewBox="0 0 4096 4096"
    fill="none"
    :class="[hover && 'opacity-75 hover:opacity-100 group']"
  >
    <path
      d="M2332.35 2928.59L2164.66 2620.91L1909.47 2826.03L1982.38 2928.59H2332.35Z"
      fill="#FAFAFA"
      stroke="#FAFAFA"
    />
    <path
      d="M356.363 3118.88L331.666 3075.1L3776 1456.16L356.625 3118.97C356.53 3119.01 356.415 3118.98 356.363 3118.88Z"
      fill="#00FFE8"
      :class="[
        hover ? 'group-hover:fill-primary-400 fill-white' : 'fill-primary-400',
      ]"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M320 3045.79L1340.76 980L1916.76 2056.85L3754.13 1448.83L320 3045.79ZM1005.37 2401.15L1333.47 1624.64L1603.24 2166.73L1005.37 2401.15Z"
      fill="url(#paint0_linear_267_76)"
    />
    <path
      d="M1934.26 2027.55L3717.67 1448.83L1898.97 1968.94L1934.26 2027.55Z"
      :class="[
        hover ? 'group-hover:fill-primary-400 fill-white' : 'fill-primary-400',
      ]"
    />
    <defs>
      <linearGradient
        id="paint0_linear_267_76"
        x1="1340.76"
        y1="980"
        x2="1914"
        y2="2311.29"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.927083" stop-color="#FAFAFA" />
        <stop offset="0.984375" stop-color="#C6C6C6" />
      </linearGradient>
    </defs>
  </svg>
</template>
