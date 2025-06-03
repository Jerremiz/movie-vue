<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="login-header">
        <h2>登录</h2>
      </div>
      <el-form :model="loginForm" ref="loginFormRef" :rules="rules" label-width="80px" size="large"
        class="centered-form">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="submitForm">登录</el-button>
          <el-button @click="goToRegister">注册账号</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();

const loginFormRef = ref(null);
const loading = computed(() => authStore.loading);

const loginForm = reactive({
  username: '',
  password: ''
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 3, message: '密码长度不能少于3个字符', trigger: 'blur' }
  ]
};

const submitForm = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await authStore.login(loginForm.username, loginForm.password);
        ElMessage.success('登录成功');
        router.push('/');
      } catch (error) {
        console.error('登录错误:', error);
        ElMessage.error(error.response?.data?.message || '登录失败');
      }
    } else {
      return false;
    }
  });
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 120px);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 450px;
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.centered-form {
  text-align: center;
}

.centered-form :deep(.el-form-item__content) {
  justify-content: center;
  margin-left: 12px !important;
  /* 覆盖Element Plus默认的左边距 */
}

/* 移除双重居中样式 */
.el-form-item:last-child {
  margin-bottom: 0;
}

/* 添加按钮间距 */
.el-button+.el-button {
  margin-left: 30px;
}
</style>
