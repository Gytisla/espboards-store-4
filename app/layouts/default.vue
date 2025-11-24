<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header with padding top for fixed positioning -->
    <AppHeader />
    
    <!-- Main content area with padding for fixed header -->
    <main class="flex-1 pt-16">
      <slot />
    </main>
    
    <!-- Footer -->
    <AppFooter />
  </div>
</template>
