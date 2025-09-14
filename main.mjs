//必要なライブラリをインポート
import { Client, GatewayIntentBits, Partials } from 'discord.js';
import 'dotenv/config';
import http from 'http'; // httpモジュールを追加

// 必要なIntentsを定義
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

// ニックネームをリセットする特定のチャンネルIDを指定
// ここをニックネームを戻したいチャンネルのIDに変更してください
const NICKNAME_RESET_CHANNEL_ID = '1416289553639014461';

// 変更前のニックネームを一時的に保存するためのMap
// キー: ユーザーID, 値: 変更前のニックネーム
const originalNicknames = new Map();

// botが起動したときのイベント
client.once('ready', () => {
  console.log(`Botが起動しました！ ${client.user.tag} としてログインしました。`);
});

// メッセージが送信されたときのイベント
client.on('messageCreate', async (message) => {
  // bot自身のメッセージには反応しないようにする
  if (message.author.bot) return;

  // botへのメンションであるか、特定のチャンネルでの発言であるか、そして「切れ者」というワードが含まれているかを確認
  const isBotMentioned = message.mentions.users.has(client.user.id);
  const isCorrectChannel = message.channel.id === NICKNAME_RESET_CHANNEL_ID;
  const hasKeyword = message.content.includes('切れ者');

  if (isBotMentioned && isCorrectChannel && hasKeyword) {
    if (message.mentions.users.size === 1) {
      const member = message.member;
      
      // 1%から120%の切れ者確率をランダムで生成
      const probability = Math.floor(Math.random() * 120) + 1;
      const newNickname = `切れ者確率${probability}％`;
      const originalName = message.author.displayName;
      
      // 変更前のニックネームをMapに保存
      originalNicknames.set(message.author.id, originalName);

      // ニックネームの変更を試みる
      try {
        await member.setNickname(newNickname, '切れ者確率の変更');
        
        // 変更後のセリフを送信
        // 太字と大きい文字にするためにマークダウンの#を使っています
        await message.channel.send(
          `**# フン。\n` +
          `# ${originalName}というのかい？\n` +
          `# 贅沢な名だねぇ。\n` +
          `# 今からお前の名前は${newNickname}だ。\n` +
          `# いいかい？${newNickname}だ。\n` +
          `# 分かったら返事をするんだ、${newNickname}！！**`
        );
      } catch (error) {
        console.error('ニックネームの変更に失敗しました:', error);
        await message.channel.send(
          '権限がないため、ニックネームを変更できませんでした。`MANAGE_NICKNAMES`の権限を付与してください。'
        );
      }
    }
  }

  // 特定のチャンネルでの画像投稿を検知してニックネームを戻す
  if (message.channel.id === NICKNAME_RESET_CHANNEL_ID) {
    // メッセージに画像添付が含まれているかを確認
    if (message.attachments.size > 0) {
      // ユーザーのニックネームをリセット
      try {
        // Mapから元のニックネームを取得
        const originalNickname = originalNicknames.get(message.author.id);
        if (originalNickname) {
          await message.member.setNickname(originalNickname, '画像を投稿したため、ニックネームをリセット');
          // リセットが完了したらMapから情報を削除
          originalNicknames.delete(message.author.id);
          await message.channel.send(`**# それがおまえの答えかい？\n# 行きな！\n# お前の勝ちだ！早くいっちまいな！！\n# フン！**`);
        } else {
          // 元のニックネーム情報がない場合は何もしない
          console.log('元のニックネーム情報が見つかりませんでした。');
        }
      } catch (error) {
        console.error('ニックネームのリセットに失敗しました:', error);
      }
    }
  }
});

// .envファイルからDiscordトークンを使ってbotにログイン
client.login(process.env.DISCORD_TOKEN);

// ---
// RenderのWebサービスがポートを監視できるように、シンプルなHTTPサーバーを起動します
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Discord Bot is running!');
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Web server is listening on port ${port}`);
});
