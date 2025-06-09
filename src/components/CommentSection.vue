<template>
  <div class="comment-section">
    <!-- 评论列表 -->
    <div v-if="comments.length > 0" class="comments-list">
      <h3>评论 ({{ comments.length }})</h3>
      <el-divider />
      <div v-for="comment in comments" :key="comment.createdAt" class="comment-item">
        <div class="comment-header">
          <div class="user-info">
            <el-avatar size="small" :src="avatarUrls[comment.userId] || ''" />
            <span class="username">{{ comment.userName }}</span>
          </div>
          <div class="comment-date">{{ formatDate(comment.createdAt) }}</div>
        </div>
        <div class="comment-content">{{ comment.comment }}</div>
        <div v-if="canDelete(comment)" class="comment-actions">
          <el-button size="small" type="danger" @click="deleteComment(comment)">删除</el-button>
        </div>
      </div>
    </div>
    <div v-else class="no-comments">
      <p>暂无评论</p>
    </div>

    <!-- 添加评论表单 -->
    <div v-if="isAuthenticated" class="add-comment">
      <h3>添加评论</h3>
      <el-divider />
      <el-form>
        <el-form-item>
          <el-input v-model="newComment" type="textarea" :rows="3" placeholder="写下你的评论..."></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="submitComment">提交评论</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-else class="login-prompt">
      <router-link to="/login">登录</router-link> 后才能发表评论
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { userApi } from '@/services/api';
import { useCommentStore } from '@/stores/comment';
import { ElMessage, ElMessageBox } from 'element-plus';

const props = defineProps({
  movieId: {
    type: String,
    required: true
  }
});

const authStore = useAuthStore();
const commentStore = useCommentStore();
const newComment = ref('');
const submitting = ref(false);
const avatarUrls = ref({}); // 存储用户头像URL的映射

// 检查用户是否已登录
const isAuthenticated = computed(() => authStore.isAuthenticated);

// 加载用户头像
const loadUserAvatar = async (userId) => {
  const userInfoResponse = await userApi.getUserInfo(userId);
  const userData = userInfoResponse.data;
  avatarUrls.value[userId] = userData.avatarUrl 
    ? `https://mondaydb.top${userData.avatarUrl}` 
    : '';
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 检查当前用户是否可以删除评论
const canDelete = (comment) => {
  // 如果用户未登录，不能删除任何评论
  if (!isAuthenticated.value) return false;

  // 用户只能删除自己的评论
  return authStore.currentUser.id === comment.userId;
};

// 提交评论
const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('评论内容不能为空');
    return;
  }

  submitting.value = true;
  try {
    await commentStore.addComment(
      authStore.currentUser.id,
      props.movieId,
      newComment.value.trim()
    );

    // 清空评论框
    newComment.value = '';

    // 重新获取该电影的所有评论
    await fetchMovieComments();

    ElMessage.success('评论成功');
  } catch (error) {
    console.error('提交评论失败:', error);
    ElMessage.error('评论发布失败');
  } finally {
    submitting.value = false;
  }
};

// 删除评论
const deleteComment = async (comment) => {
  ElMessageBox.confirm('确认删除此评论?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await commentStore.deleteComment(comment.userId, comment.id);
      // 重新获取评论列表
      await fetchMovieComments();
      ElMessage.success('评论已删除');
    } catch (error) {
      console.error('删除评论失败:', error);
      ElMessage.error('删除评论失败');
    }
  }).catch(() => { });
};

// 获取电影评论列表
const comments = computed(() => commentStore.movieComments);

const fetchMovieComments = async () => {
  try {
    await commentStore.fetchMovieComments(props.movieId);
    
    // 获取评论后加载所有用户的头像
    const uniqueUserIds = [...new Set(commentStore.movieComments.map(comment => comment.userId))];
    for (const userId of uniqueUserIds) {
      await loadUserAvatar(userId);
    }
  } catch (error) {
    console.error('获取评论失败:', error);
  }
};

// 组件挂载时获取评论
onMounted(() => {
  fetchMovieComments();
});
</script>

<style scoped>
.comment-section {
  margin-top: 20px;
}

.comments-list {
  margin-bottom: 30px;
}

.comment-item {
  padding: 15px 0;
  border-bottom: 1px solid #ebeef5;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.username {
  font-weight: bold;
  color: #303133;
}

.comment-date {
  font-size: 12px;
  color: #909399;
}

.comment-content {
  margin-bottom: 10px;
  line-height: 1.5;
  white-space: pre-line;
}

.comment-actions {
  display: flex;
  justify-content: flex-end;
}

.add-comment {
  margin-top: 40px;
}

.no-comments {
  padding: 20px 0;
  text-align: center;
  color: #909399;
}

.login-prompt {
  text-align: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  margin-top: 20px;
}

.login-prompt a {
  color: #409EFF;
  font-weight: bold;
}
</style>
