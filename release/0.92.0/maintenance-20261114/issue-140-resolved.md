谢谢 @ziladan，终于补齐 npm 交付：**0.92.0 已实际发布，latest=0.92.0**。现在可用：

```sh
dsh plugin --profile web add dsh-quant@0.92.0
```

[五套实际 npm 包验收](https://github.com/pengpengyi92/dsh-quant/actions/runs/43503675329)全部通过，包含你请求的 rc.2 和 rc.5；每套验证共享宿主依赖、真实 Loader、59 工具注册和 56 次确定性调用。此重复请求与 #139 一起完成关闭；完整桌面/模型会话和三个实时 API 仍单独保留为未验证。

感谢升级反馈与耐心，也感谢 @hufeide 的原始兼容性贡献。欢迎继续一起改进，keep going!
