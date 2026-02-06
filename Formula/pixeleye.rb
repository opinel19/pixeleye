class Pixeleye < Formula
  desc "CLI tool to analyze localized UI screenshots with Gemini or ChatGPT"
  homepage "https://github.com/opinel19/pixeleye"
  url "https://registry.npmjs.org/pixeleye/-/pixeleye-0.1.0.tgz"
  sha256 "REPLACE_WITH_TARBALL_SHA256"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink libexec/"bin/pixeleye"
  end

  test do
    assert_predicate bin/"pixeleye", :exist?
  end
end
