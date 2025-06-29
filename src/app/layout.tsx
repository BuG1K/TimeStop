import "@/styles/globals.scss";

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <body>
      {children}
    </body>
  </html>
);

export default RootLayout;
