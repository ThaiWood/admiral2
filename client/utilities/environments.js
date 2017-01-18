export const enviornmentIcon = (env) => {
  const info = env.split(/\|/);
  let icon = "fa-fire";
  if (info[0] === "ie") {
    icon = "fa-internet-explorer";
  }
  if (info[0] === "chrome") {
    icon = "fa-chrome";
  }
  if (info[0] === "safari") {
    icon = "fa-safari";
  }
  if (info[0] === "iOS") {
    icon = "fa-apple";
  }
  if (info[0] === "phantomjs") {
    icon = "fa-space-shuttle";
  }
  return icon;
}

export const enviornmentVersion = (env) => {
  const info = env.split(/\|/);
  return info.length > 1 ? info[1] : "";
}

export const enviornmentWidth = (env) => {
  const info = env.split(/\|/);
  return info.length > 2 ? info[2] : "";
}

export const buildColumns = (envs) => {
  const environments = envs.sort();

  const colWidth = 60.0 / environments.length;
  const columns = [];
  for (env of environments) {
    let icon = enviornmentIcon(env);

    const version = enviornmentVersion(env);
    const width = enviornmentWidth(env);

    let name = version;
    if (width && width.length > 0) {
      if (name.length > 0) {
        name += ':'
      }
      name += `${width}`;
    }

    const info = env.split(/\|/);
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

  return {columns, colWidth, sections};
}
