#!/bin/bash

echo "🚀 Setting up ngrok for local development..."

# Check if ngrok is already installed
if command -v ngrok &> /dev/null; then
    echo "✅ ngrok is already installed"
    ngrok version
else
    echo "📦 Installing ngrok..."

    # Try different installation methods
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew install ngrok/ngrok/ngrok
        else
            echo "❌ Homebrew not found. Please install Homebrew first:"
            echo "   /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
        echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
        sudo apt update && sudo apt install ngrok
    else
        echo "❌ Unsupported OS. Please install ngrok manually from https://ngrok.com/download"
        exit 1
    fi
fi

echo ""
echo "✅ ngrok setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Start your dev server: npm run dev"
echo "2. Start ngrok: ngrok http 3002"
echo "3. Copy the ngrok URL"
echo "4. Update Figma OAuth callback URL to use ngrok URL"
echo "5. Test the OAuth flow"
