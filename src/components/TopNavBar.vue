<template>
  <el-row class="top-actions" justify="space-between" align="middle">
    <el-col :span="12">
      <router-link to="/checkout" class="subscription-link">
        <el-button type="primary" size="small" class="upgrade-button">
          <el-icon class="upgrade-icon"><Star /></el-icon>
          升级到专业版
        </el-button>
      </router-link>
    </el-col>




    <div class="user-actions" align="middle">
      <span class="welcome-text">欢迎，{{ username }}</span>

      <!-- 添加下拉菜单 -->
      <el-dropdown trigger="click" class="user-dropdown">
        <el-button size="small">
          <el-icon><Setting /></el-icon>
          设置
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleSupport">
              <el-icon><Message /></el-icon>
              联系支持
            </el-dropdown-item>

            <el-dropdown-item @click="showUserAgreement">
              <el-icon><Document /></el-icon>
              用户协议
            </el-dropdown-item>
            <el-dropdown-item @click="showPrivacyPolicy">
              <el-icon><Lock /></el-icon>
              隐私政策
            </el-dropdown-item>

            <el-dropdown-item @click="handleDeleteAccount" divided>
              <el-icon><Delete /></el-icon>
              删除账号
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>


      <el-button 
        class="logout-button"
        size="small"
        @click="handleLogout"
        :loading="loading"
      >
        <el-icon><SwitchButton /></el-icon>
        退出登录
      </el-button>
    </div>
  </el-row>

    <!-- 用户协议对话框 -->
    <el-dialog
    v-model="userAgreementVisible"
    title="用户协议"
    width="60%"
    :close-on-click-modal="false"
  >
    <div class="agreement-content">
      <pre>{{ userAgreementText }}</pre>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="userAgreementVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 隐私政策对话框 -->
  <el-dialog
    v-model="privacyPolicyVisible"
    title="隐私政策"
    width="60%"
    :close-on-click-modal="false"
  >
    <div class="agreement-content">
      <pre>{{ privacyPolicyText }}</pre>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="privacyPolicyVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { computed } from 'vue'
import { Star, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useLogin } from '@/composables/useLogin' 
import { topNavBar } from '@/composables/topNavBar'

const userStore = useUserStore()
const username = computed(() => userStore.username)
const { handleLogout, loading } = useLogin()

// 对话框显示状态
const userAgreementVisible = ref(false)
const privacyPolicyVisible = ref(false)

// 用户协议文本
const userAgreementText = `欢迎使用 MoneyKeeper（以下简称"本应用"）。为了保障您的合法权益，请在使用本应用前仔细阅读并充分理解以下条款。

一、服务内容
记账功能：本应用为用户提供记账与统计的功能，便于用户跟踪日常开支或收入情况。
统计参考：本应用提供的统计和分析结果仅供参考，不构成任何投资、理财或税务建议。

二、用户责任
信息真实性：用户须对自身输入的记账信息真实性和合法性负责。本应用对用户数据不进行核实或审计，也不承担由此造成的一切后果或责任。
守法合规：用户不得利用本应用记录或传播违法、违规或涉嫌侵权的内容，若因此导致损失或纠纷，责任由用户自行承担。
数据备份：本应用当前不提供云端同步功能，用户对本地数据应自行进行必要的备份操作。若因用户误删、设备损坏或其他原因导致数据丢失，开发者不承担任何责任。

三、开发者责任
数据用途：我们不会使用或分析用户的任何记账数据，也不会将用户数据用于与本应用无关的任何用途。
第三方共享：我们不会与任何第三方共享用户数据，也不会向任何第三方出售、转让或泄露用户数据。
功能稳定：我们将尽力维护本应用的正常运行，但因不可抗力或技术限制导致的中断、数据丢失或错误不承担任何赔偿责任。

四、协议变更
我们保留在必要时修改、更新或终止本协议条款的权利。
若本协议发生重大变更，我们将在本应用内予以公告。若您在变更生效后继续使用本应用，则视为同意并接受新的协议内容。`

// 隐私政策文本
const privacyPolicyText = `我们非常重视您的隐私，以下为我们在收集、使用和保护用户信息方面的原则与措施。

一、信息收集范围
主动提供信息：本应用仅收集用户在使用时主动输入的记账信息，包括账目金额、类别、时间等。
不收集个人信息：本应用不收集任何个人身份信息，例如姓名、身份证号、联系方式等。
不收集图片：本应用暂不支持上传图片或访问设备相机、相册等功能。

二、信息的使用
核心功能：用户输入的记账数据，仅用于实现本应用的基础功能（如统计、展示、筛选等），不会被用作任何与本应用无关的用途。
不共享/不出售：我们不会将用户的记账数据向任何第三方披露、共享或出售。
数据分析：本应用不会针对用户提供的记账数据进行任何形式的外部分析或商业化处理。

三、数据存储与安全
本地存储：所有记账数据均存储在用户本地设备中，不会同步到云端。
安全措施：我们对本地应用进行基本安全防护，但由于技术所限，无法保证在极端情况下的数据绝对安全。请您妥善保管好个人设备，以减少数据被非法获取的风险。

四、用户权利
数据修改/删除：用户可随时在本应用中修改或删除其输入的任何记账信息。
卸载风险：若用户卸载本应用，存储在本地设备中的全部记账数据可能被同时删除且无法恢复。

五、隐私政策更新
更新权限：我们保留随时更新本隐私政策的权利，届时将在本应用内公告或提示。
继续使用的默认同意：若您在更新内容发布后继续使用本应用，则视为同意并接受最新的隐私政策。
不同意条款：如果您对更新后的隐私政策条款有异议，可停止使用本应用并通过联系我们以寻求解决。`

// 显示用户协议
const showUserAgreement = () => {
  userAgreementVisible.value = true
}

// 显示隐私政策
const showPrivacyPolicy = () => {
  privacyPolicyVisible.value = true
}

// 处理联系支持按钮点击
const handleSupport = () => {
  window.location.href = 'mailto:rochelle.wang1116@gmail.com'
}

const {
  handleDeleteAccount
} = topNavBar()

</script>

<style src="@/assets/styles/topNavBar.css" scoped></style> 