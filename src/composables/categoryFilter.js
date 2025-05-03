import { useCategory } from '@/composables/useCategory';
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import request from '@/utils/axios'; // 引入axios


export function useCategoryFilter() {
    // 获取用户信息
    const userStore = useUserStore();
    // 获取分类相关方法和数据
    const {
        expenseCategories, // 支出分类
        incomeCategories,  // 收入分类
        fetchCategories    // 获取分类方法
    } = useCategory();
    
    // 当前选中的类型（支出/收入）
    const selectedType = ref('expense');
    // 当前选中的分类名称
    const selectedCategory = ref('');
    // 当前用户ID
    const userId = computed(() => userStore.userId);
    // 根据类型动态切换分类列表
    const categoryList = computed(() => {
        return selectedType.value === 'expense'
            ? expenseCategories.value
            : incomeCategories.value;
    });

    // 切换类型时，重置分类选择
    function onTypeChange(type) {
        selectedType.value = type;
        selectedCategory.value = '';
    }

    // 切换分类时，自动请求后端并emit结果
    async function onCategoryChange(categoryName) {
        selectedCategory.value = categoryName;
        if (!categoryName || !userId.value) {
            return [];
        }
        return await fetchRecordListByCategory(categoryName, userId.value);
    }

    // 封装后端请求方法
    async function fetchRecordListByCategory(categoryName, userId) {
        try {
            const response = await request.get(`/records/listByCategoryName/${categoryName}/${userId}`);
            // 假设 response.data 是原始数组
            return (response.data || []).map(record => ({
                id: record.id,
                type: record.type === '支出' ? 'expense' : 'income',
                amount: record.amount,
                category: record.categoryName,
                categoryId: record.categoryId,
                date: record.transactionDate,
                note: record.notes
            }));
        } catch (error) {
            console.error('获取分类记录失败:', error);
            return [];
        }
    }

    // 初始化加载分类
    onMounted(() => {
        fetchCategories();
    });


    
    // 返回需要暴露给组件使用的数据和方法
    return {
        selectedType,
        selectedCategory,
        categoryList,
        userId,
        onTypeChange,
        onCategoryChange,
        fetchCategories,
        fetchRecordListByCategory
    };
}

