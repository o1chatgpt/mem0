import * as ftp from "basic-ftp"
import * as path from "path"
import { config } from "../lib/config"

async function deployToFTP() {
  console.log("Starting deployment to FTP server...")

  const client = new ftp.Client()
  client.ftp.verbose = true

  try {
    // Access config properties at runtime
    await client.access({
      host: config.ftpHost,
      port: config.ftpPort,
      user: config.ftpUser,
      password: config.ftpPassword,
      secure: false,
    })

    console.log("Connected to FTP server")

    // Navigate to the root directory
    await client.ensureDir(config.ftpRootDir)

    // Upload the build directory
    console.log("Uploading build files...")
    await client.uploadFromDir(path.join(process.cwd(), "out"))

    console.log("Deployment completed successfully!")
  } catch (err) {
    console.error("Error during deployment:", err)
  } finally {
    client.close()
  }
}

// Only run the deployment if this file is executed directly
if (require.main === module) {
  deployToFTP().catch(console.error)
}
