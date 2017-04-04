export const browserIcon = (env) => {
  const info = env.split("_");

  let icon = "fa-fire";
  switch (info[0].toLowerCase()) {
    case "chrome":
      icon = "fa-chrome";
      break;
    case "microsoftedge":
      icon = "fa-edge";
      break;
    case "ie":
      icon = "fa-internet-explorer";
      break;
    case "safari":
      icon = "fa-safari";
      break;
    case "firefox":
      icon = "fa-firefox";
      break;
    case "iphone":
      icon = "fa-mobile";
      break;
    case "ipad":
      icon = "fa-tablet";
      break;
    case "android":
      icon = "fa-android";
      break;
    case "phantomjs":
      icon = "fa-space-shuttle";
      break;
    default:
      icon = "fa-fire";
      break;
  }

  return icon;
}

export const browserVersion = (env) => {
  const info = env.split("_");
  const alphabeticalVersion = ["dev", "beta"];

  let v = info[1];
  if (alphabeticalVersion.indexOf(v) === -1
    && (parseInt(info[2]) || parseInt(info[2]) === 0)) {
    // minor version exist
    v = `${v}.${info[2]}`;
  }

  return v;
}

export const enviornmentWidth = (env) => {
  const info = env.split(/\|/);
  // return info.length > 2 ? info[2] : "";
  return "Lei";
}

export const buildColumns = (envs) => {
  const environments = envs.sort();

  const colWidth = 60.0 / environments.length;
  const columns = [];
  for (env of environments) {
    let icon = browserIcon(env);

    const version = browserVersion(env);
    const width = null;
    // const width = enviornmentWidth(env);

    let name = version;
    if (width && width.length > 0) {
      if (name.length > 0) {
        name += ':'
      }
      name += `${width}`;
    }

    // const info = env.split(/\|/);
    const info = env.split("_");
    columns.push({
      icon,
      version,
      width,
      name,
      section: info[0],
      key: env
    });
  }

  let curSection = null;
  const sections = [];
  for (var col of columns) {
    if (col.section !== curSection) {
      sections.push({
        section: col.section,
        icon: col.icon,
        cols: 1
      });
      curSection = col.section;
    } else {
      sections[sections.length - 1].cols += 1;
    }
  }

  return { columns, colWidth, sections };
}
