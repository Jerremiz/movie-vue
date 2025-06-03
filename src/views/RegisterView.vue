<template>
  <div class="register-container">
    <el-card class="register-card">
      <div class="register-header">
        <h2>注册</h2>
      </div>
      <el-form :model="registerForm" ref="registerFormRef" :rules="rules" label-width="80px" size="large"
        class="centered-form">
        <el-form-item label="用户名" prop="name">
          <el-input v-model="registerForm.name" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码"
            show-password></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" @click="submitForm">注册</el-button>
          <el-button @click="goToLogin">返回登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();
const registerFormRef = ref(null);
const loading = ref(false);

const registerForm = reactive({
  name: '',
  password: '',
  confirmPassword: ''
});

// 验证两次密码是否一致
const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'));
  } else {
    callback();
  }
};

const rules = {
  name: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能少于3个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 3, message: '密码长度不能少于3个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }
  ]
};

const submitForm = async () => {
  if (!registerFormRef.value) return;

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const userData = {
          name: registerForm.name,
          password: registerForm.password
        };

        await authStore.register(userData);
        ElMessage.success('注册成功，请登录');
        router.push('/login');
      } catch (error) {
        console.error('注册错误:', error);
        ElMessage.error(error.response?.data?.message || '注册失败');
      } finally {
        loading.value = false;
      }
    } else {
      return false;
    }
  });
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 120px);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 450px;
}

.register-header {
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
