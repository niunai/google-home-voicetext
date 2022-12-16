// This is a tool for checking IP address and network module names.
import os from "os";
const ips = os.networkInterfaces();
Object.keys(ips).forEach((key) => {
  let modules = ips[key];
  modules.forEach((element) => {
    if (element.family === "IPv4") {
      console.log(key, element.address);
    }
  });
});
