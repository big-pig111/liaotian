// wallet-connect.js
// 支持Phantom、OKX钱包的Solana链钱包连接

let walletProvider = null;
let walletAddress = null;

// 检查钱包扩展
function getProvider() {
    console.log('检查钱包扩展...');
    
    // Phantom钱包
    if (window.solana && window.solana.isPhantom) {
        console.log('检测到Phantom钱包');
        return window.solana;
    }
    
    // OKX钱包
    if (window.okxwallet && window.okxwallet.solana) {
        console.log('检测到OKX钱包');
        return window.okxwallet.solana;
    }
    
    // Solflare钱包
    if (window.solflare && window.solflare.isSolflare) {
        console.log('检测到Solflare钱包');
        return window.solflare;
    }
    
    // Backpack钱包
    if (window.backpack && window.backpack.isBackpack) {
        console.log('检测到Backpack钱包');
        return window.backpack;
    }
    
    console.log('未检测到支持的Solana钱包扩展');
    return null;
}

// 检查特定钱包是否可用
function checkWalletAvailable(walletType) {
    switch(walletType) {
        case 'phantom':
            return !!(window.solana && window.solana.isPhantom);
        case 'okx':
            return !!(window.okxwallet && window.okxwallet.solana);
        case 'solflare':
            return !!(window.solflare && window.solflare.isSolflare);
        case 'backpack':
            return !!(window.backpack && window.backpack.isBackpack);
        default:
            return false;
    }
}

// 连接钱包
async function connectSolanaWallet(walletType = null) {
    console.log('开始连接Solana钱包...', walletType);
    
    if (walletType) {
        // 检查特定钱包是否可用
        if (!checkWalletAvailable(walletType)) {
            const errorMsg = `未检测到${walletType}钱包扩展，请先安装`;
            console.log(errorMsg);
            throw new Error(errorMsg);
        }
        
        // 根据钱包类型获取provider
        switch(walletType) {
            case 'phantom':
                walletProvider = window.solana;
                break;
            case 'okx':
                walletProvider = window.okxwallet.solana;
                break;
            case 'solflare':
                walletProvider = window.solflare;
                break;
            case 'backpack':
                walletProvider = window.backpack;
                break;
        }
    } else {
        // 自动检测钱包
        walletProvider = getProvider();
    }
    
    if (!walletProvider) {
        console.log('未检测到钱包扩展');
        const errorMsg = '请先安装Phantom、OKX或Solflare钱包扩展\n\nPhantom: https://phantom.app/\nOKX: https://www.okx.com/web3\nSolflare: https://solflare.com/';
        throw new Error(errorMsg);
    }
    
    console.log('检测到钱包扩展:', walletProvider);
    
    try {
        console.log('正在连接钱包...');
        const resp = await walletProvider.connect();
        console.log('钱包连接响应:', resp);
        
        walletAddress = resp.publicKey ? resp.publicKey.toString() : resp.address;
        console.log('钱包地址:', walletAddress);
        
        window.dispatchEvent(new CustomEvent('walletConnected', {detail: {address: walletAddress, walletType: walletType}}));
        return walletAddress;
    } catch (e) {
        console.error('钱包连接失败:', e);
        throw new Error('钱包连接失败: ' + (e.message || e));
    }
}

// 断开钱包
async function disconnectSolanaWallet() {
    if (walletProvider && walletProvider.disconnect) {
        await walletProvider.disconnect();
        walletAddress = null;
        window.dispatchEvent(new CustomEvent('walletDisconnected'));
    }
}

// 获取当前钱包地址
function getSolanaWalletAddress() {
    return walletAddress;
}

// 检查钱包连接状态
function checkWalletConnection() {
    const provider = getProvider();
    if (provider && provider.isConnected) {
        return provider.isConnected();
    }
    return false;
}

// 初始化钱包连接
function initWalletConnection() {
    console.log('初始化钱包连接...');
    
    // 检查是否已连接
    if (checkWalletConnection()) {
        console.log('钱包已连接');
        // 获取当前连接的钱包地址
        const provider = getProvider();
        if (provider && provider.publicKey) {
            walletAddress = provider.publicKey.toString();
            window.dispatchEvent(new CustomEvent('walletConnected', {detail: {address: walletAddress}}));
        }
    } else {
        console.log('钱包未连接');
    }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWalletConnection);
} else {
    initWalletConnection();
}

// 暴露全局函数
window.connectSolanaWallet = connectSolanaWallet;
window.disconnectSolanaWallet = disconnectSolanaWallet;
window.getSolanaWalletAddress = getSolanaWalletAddress;
window.checkWalletConnection = checkWalletConnection; 