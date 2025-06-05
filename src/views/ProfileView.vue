<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <h2>个人信息</h2>
      </template>

      <div class="profile-content">
        <!-- 个人信息展示 -->
        <div class="avatar-section">
          <div class="avatar-container">
            <el-avatar :size="120" :src="avatarUrl" />
            <div class="avatar-upload">
              <el-upload class="avatar-uploader" :show-file-list="false" :before-upload="beforeAvatarUpload"
                :http-request="uploadAvatar">
                <el-button size="small" type="primary">
                  <el-icon>
                    <Upload />
                  </el-icon> 上传头像
                </el-button>
              </el-upload>
            </div>
          </div>
        </div>

        <div class="user-info">
          <h3>{{ user.username }}</h3>
          <div class="info-item">
            <span class="label">用户ID:</span>
            <span>{{ user.id }}</span>
          </div>
        </div>
      </div>

      <!-- 我的评论 -->
      <div class="comments-section">
        <h3>我的评论</h3>
        <div v-if="loadingComments" class="loading-comments">
          <el-skeleton :rows="5" animated />
        </div>

        <div v-else-if="comments.length === 0" class="no-comments">
          <el-empty description="暂无评论" :image-size="100" />
        </div>

        <el-timeline v-else>
          <el-timeline-item v-for="(comment, index) in comments" :key="index" :timestamp="formatDate(comment.createdAt)"
            placement="top">
            <el-card>
              <div class="comment-card-header">
                <h4>{{ comment.title }}</h4>
                <el-button type="danger" size="small" icon="Delete" @click="handleDeleteComment(comment)">
                  删除
                </el-button>
              </div>
              <p>{{ comment.comment }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useCommentStore } from '@/stores/comment';
import { userApi } from '@/services/api';
import { ElMessage, ElMessageBox } from 'element-plus';

const authStore = useAuthStore();
const commentStore = useCommentStore();

const user = computed(() => authStore.currentUser || {});
const loadingComments = ref(false);
const comments = ref([]);

// 头像URL处理
const avatarUrl = computed(() => {
  if (!user.value.avatarUrl) return '';

  return `https://mondaydb.top${user.value.avatarUrl}`;
});

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

// 上传前校验
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 上传头像
const uploadAvatar = async (options) => {
  try {
    // 上传头像
    await userApi.uploadAvatar(user.value.id, options.file);

    // 重新获取用户信息
    const userInfoResponse = await userApi.getUserInfo(user.value.id);
    const updatedUser = userInfoResponse.data;

    // 更新头像
    authStore.updateUserAvatar(updatedUser.avatarUrl);

    ElMessage.success('头像上传成功');
  } catch (error) {
    console.error('头像上传失败:', error);
    ElMessage.error('头像上传失败');
  }
};

// 获取用户评论
const fetchUserComments = async () => {
  if (!user.value.id) return;

  loadingComments.value = true;
  try {
    const response = await commentStore.fetchUserComments(user.value.id);
    comments.value = response;
  } catch (error) {
    console.error('获取评论失败:', error);
    ElMessage.error('获取评论失败');
  } finally {
    loadingComments.value = false;
  }
};

// 删除评论
const handleDeleteComment = (comment) => {
  ElMessageBox.confirm('确认删除该评论?', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await commentStore.deleteComment(user.value.id, comment.id);
      // 刷新评论列表
      fetchUserComments();
      ElMessage.success('评论已删除');
    } catch (error) {
      console.error('删除评论失败:', error);
      ElMessage.error('删除评论失败');
    }
  }).catch(() => { });
};

// 组件挂载时获取用户评论
onMounted(() => {
  fetchUserComments();
});
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px;
}

.profile-card {
  margin-bottom: 30px;
}

.profile-content {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.avatar-section {
  margin-right: 30px;
}

.avatar-container {
  text-align: center;
}

.avatar-upload {
  margin-top: 10px;
}

.user-info {
  flex: 1;
}

.user-info h3 {
  margin-top: 0;
  font-size: 24px;
}

.info-item {
  margin: 10px 0;
}

.info-item .label {
  font-weight: bold;
  margin-right: 10px;
}

.comments-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.loading-comments {
  padding: 20px 0;
}

.no-comments {
  padding: 20px 0;
  text-align: center;
}

.comment-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-card-header h4 {
  margin: 0;
}

@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    text-align: center;
  }

  .avatar-section {
    margin-right: 0;
    margin-bottom: 20px;
  }
}
</style>
