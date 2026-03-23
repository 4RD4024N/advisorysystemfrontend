# LM Studio + Qwen Coder Setup for VS Code

## Prerequisites

1. **LM Studio** installed and running
2. **Qwen Coder** model downloaded in LM Studio
3. **VS Code** installed

## Step 1: Configure LM Studio

1. Open LM Studio
2. Load your Qwen Coder model
3. Go to the **Local Server** tab
4. Click **Start Server**
5. Note the server address (usually `http://localhost:1234`)
6. Keep LM Studio running in the background

### LM Studio Server Settings (Recommended)

- **Port**: 1234 (default)
- **Context Length**: 32768 or your model's max
- **Temperature**: 0.2 (for coding)
- **Enable CORS**: Yes

## Step 2: Install Continue Extension

The Continue extension allows you to use local LLMs in VS Code.

### Option A: Install from VS Code Marketplace

1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac)
3. Search for "Continue"
4. Install the "Continue - Code AI Assistant" extension
5. Reload VS Code

### Option B: Install from Command Line

```powershell
code --install-extension continue.continue
```

## Step 3: Configuration Files

I've created two configuration files:

### 1. `.vscode/settings.json` (Project-level)
Located in your project root - enables Continue features for this project.

### 2. `~/.continue/config.json` (Global)
Located in `C:\Users\arda0\.continue\config.json` - configures Continue to use LM Studio.

**Important**: The config file has been created. If you need to modify it:
- Open `C:\Users\arda0\.continue\config.json`
- Verify the `apiBase` URL matches your LM Studio server
- Update the model name if needed

## Step 4: Verify Setup

1. **Check LM Studio Server**
   - Open browser to `http://localhost:1234/v1/models`
   - You should see JSON with your loaded model

2. **Test in VS Code**
   - Open any code file
   - Press `Ctrl+L` (or `Cmd+L` on Mac) to open Continue chat
   - Type a question like "Explain this code"
   - Press `Ctrl+I` for inline code editing

## Continue Extension Usage

### Keyboard Shortcuts

- `Ctrl+L`: Open Continue chat sidebar
- `Ctrl+I`: Inline code edit
- `Ctrl+Shift+R`: Highlight code and ask question
- Tab: Accept autocomplete suggestion

### Chat Commands

- `/edit` - Edit selected code
- `/comment` - Add comments to code
- `/test` - Generate unit tests
- `/cmd` - Generate shell commands
- `/share` - Export conversation

### Context Options

Continue automatically includes:
- Currently open file
- Recent edits
- Terminal output
- Compiler errors
- Git diff

## Alternative: Using OpenAI-Compatible API

If you prefer other extensions, LM Studio's server is OpenAI-compatible:

```typescript
// Example API usage
const response = await fetch('http://localhost:1234/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'qwen-coder',
    messages: [{ role: 'user', content: 'Write a function...' }],
    temperature: 0.2
  })
});
```

## Troubleshooting

### Issue: Continue can't connect to LM Studio

**Solution:**
1. Verify LM Studio server is running
2. Check the port number (1234 is default)
3. Test: `curl http://localhost:1234/v1/models`
4. Update `apiBase` in `~/.continue/config.json` if needed

### Issue: No autocomplete suggestions

**Solution:**
1. Enable in VS Code: `File > Preferences > Settings`
2. Search for "inline suggest"
3. Enable "Editor: Inline Suggest Enabled"
4. Restart VS Code

### Issue: Model responses are slow

**Solution:**
1. In LM Studio, reduce context length
2. Lower the model's rope scaling if available
3. Use GPU acceleration (check LM Studio settings)
4. Consider using a smaller/faster model variant

### Issue: Wrong model name

**Solution:**
1. In LM Studio, note the exact model name
2. Update `model` field in `~/.continue/config.json`
3. Reload VS Code window

## Performance Tips

1. **GPU Acceleration**: Enable in LM Studio settings
2. **Context Length**: Set to what you actually need (4096-8192 is usually enough)
3. **Temperature**: Keep low (0.1-0.3) for code generation
4. **Batch Size**: Increase in LM Studio for faster generation

## Advanced: MCP Server Setup

If you want deeper VS Code integration, you can set up an MCP server:

1. Create an MCP server that wraps LM Studio
2. Configure in `.github/copilot/mcp-servers.json`
3. Restart VS Code

(This is more complex - use Continue extension first)

## Recommended Extensions Combo

Install these for best experience:

```powershell
code --install-extension continue.continue
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
```

## Next Steps

1. Start LM Studio and load Qwen Coder
2. Start the local server in LM Studio
3. Install Continue extension in VS Code
4. Press `Ctrl+L` and start chatting with your local AI!

---

**Note**: Keep LM Studio running in the background whenever you want to use the AI assistant in VS Code.
