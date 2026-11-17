declare module '@emailjs/nodejs' {
  interface EmailJSResponseStatus {
    status: number;
    text: string;
  }

  interface EmailJSOptions {
    publicKey: string;
    privateKey: string;
  }

  interface EmailJS {
    send(
      serviceID: string,
      templateID: string,
      templateParams: Record<string, unknown>,
      options: EmailJSOptions
    ): Promise<EmailJSResponseStatus>;
  }

  const emailjs: EmailJS;
  export default emailjs;
}
