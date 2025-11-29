# ==============================
# 第一阶段：构建 (Build Stage)
# ==============================
FROM node:18 AS build-stage
WORKDIR /app

# 先拷贝 package.json 安装依赖 (利用缓存)
COPY package*.json ./
# 设置淘宝源加速 (可选，云端构建其实不需要，但加上也无妨)
# RUN npm config set registry https://registry.npmmirror.com
RUN npm ci

# 拷贝源代码并打包
COPY . .
RUN npm run build

# ==============================
# 第二阶段：生产环境 (Production Stage)
# ==============================
FROM nginx:stable-alpine as production-stage

# 1. 把第一阶段打包好的 dist 文件夹，复制到 Nginx 的默认目录
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 2. 把我们写的 nginx.conf 复制进去，替换默认配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3. 暴露端口
EXPOSE 80

# 4. 启动 Nginx (daemon off 是为了让容器不退出)
CMD ["nginx", "-g", "daemon off;"]