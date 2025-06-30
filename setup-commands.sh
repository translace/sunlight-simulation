# 创建项目目录
mkdir sunlight-simulation
cd sunlight-simulation

# 初始化npm项目
npm init -y

# 安装核心依赖
npm install react react-dom three @turf/turf dayjs

# 安装开发工具
npm install vite @vitejs/plugin-react -D

# 创建基本项目结构
mkdir src
touch src/index.html src/main.jsx src/App.jsx  