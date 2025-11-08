import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 引入 初始化normalize.css
import 'normalize.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
