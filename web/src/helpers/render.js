import { Tag } from '@douyinfe/semi-ui';

export function renderText(text, limit) {
  if (text.length > limit) {
    return text.slice(0, limit - 3) + '...';
  }
  return text;
}

/**
 * Render group tags based on the input group string
 * @param {string} group - The input group string
 * @returns {JSX.Element} - The rendered group tags
 */
export function renderGroup(group) {
  if (group === '') {
    return (
      <Tag size='large' key='default'>
        unknown
      </Tag>
    );
  }

  const tagColors = {
    vip: 'yellow',
    pro: 'yellow',
    svip: 'red',
    premium: 'red',
  };

  const groups = group.split(',').sort();

  return (
    <span key={group}>
      {groups.map((group) => (
        <Tag
          size='large'
          color={tagColors[group] || stringToColor(group)}
          key={group}
        >
          {group}
        </Tag>
      ))}
    </span>
  );
}

export function renderNumber(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 10000) {
    return (num / 1000).toFixed(1) + 'k';
  } else {
    return num;
  }
}

export function renderQuotaNumberWithDigit(num, digits = 2) {
  let displayInCurrency = localStorage.getItem('display_in_currency');
  num = num.toFixed(digits);
  if (displayInCurrency) {
    return '$' + num;
  }
  return num;
}

export function renderNumberWithPoint(num) {
  num = num.toFixed(2);
  if (num >= 100000) {
    // Convert number to string to manipulate it
    let numStr = num.toString();
    // Find the position of the decimal point
    let decimalPointIndex = numStr.indexOf('.');

    let wholePart = numStr;
    let decimalPart = '';

    // If there is a decimal point, split the number into whole and decimal parts
    if (decimalPointIndex !== -1) {
      wholePart = numStr.slice(0, decimalPointIndex);
      decimalPart = numStr.slice(decimalPointIndex);
    }

    // Take the first two and last two digits of the whole number part
    let shortenedWholePart = wholePart.slice(0, 2) + '..' + wholePart.slice(-2);

    // Return the formatted number
    return shortenedWholePart + decimalPart;
  }

  // If the number is less than 100,000, return it unmodified
  return num;
}

export function getQuotaPerUnit() {
  let quotaPerUnit = localStorage.getItem('quota_per_unit');
  quotaPerUnit = parseFloat(quotaPerUnit);
  return quotaPerUnit;
}

export function renderUnitWithQuota(quota) {
  let quotaPerUnit = localStorage.getItem('quota_per_unit');
  quotaPerUnit = parseFloat(quotaPerUnit);
  quota = parseFloat(quota);
  return quotaPerUnit * quota;
}

export function getQuotaWithUnit(quota, digits = 6) {
  let quotaPerUnit = localStorage.getItem('quota_per_unit');
  quotaPerUnit = parseFloat(quotaPerUnit);
  return (quota / quotaPerUnit).toFixed(digits);
}

export function renderQuotaWithAmount(amount) {
  let displayInCurrency = localStorage.getItem('display_in_currency');
  displayInCurrency = displayInCurrency === 'true';
  if (displayInCurrency) {
    return '$' + amount;
  } else {
    return renderUnitWithQuota(amount);
  }
}

export function renderQuota(quota, digits = 2) {
  let quotaPerUnit = localStorage.getItem('quota_per_unit');
  let displayInCurrency = localStorage.getItem('display_in_currency');
  quotaPerUnit = parseFloat(quotaPerUnit);
  displayInCurrency = displayInCurrency === 'true';
  if (displayInCurrency) {
    return '$' + (quota / quotaPerUnit).toFixed(digits);
  }
  return renderNumber(quota);
}

export function renderModelPrice(
  inputTokens,
  completionTokens,
  modelRatio,
  modelPrice = -1,
  completionRatio,
  groupRatio,
) {
  // 1 ratio = $0.002 / 1K tokens
  if (modelPrice !== -1) {
    return '模型价格：$' + modelPrice + ' * 分组倍率：' + groupRatio + ' = $' + modelPrice * groupRatio;
  } else {
    if (completionRatio === undefined) {
      completionRatio = 0;
    }
    // 这里的 *2 是因为 1倍率=0.002刀，请勿删除
    let inputRatioPrice = modelRatio * 2.0;
    let completionRatioPrice = modelRatio * 2.0 * completionRatio;
    let price =
      (inputTokens / 1000000) * inputRatioPrice * groupRatio +
      (completionTokens / 1000000) * completionRatioPrice * groupRatio;
    return (
      <>
        <article>
          <p>提示：${inputRatioPrice} * {groupRatio} = ${inputRatioPrice * groupRatio} / 1M tokens</p>
          <p>补全：${completionRatioPrice} * {groupRatio} = ${completionRatioPrice * groupRatio} / 1M tokens</p>
          <p></p>
          <p>
            提示 {inputTokens} tokens / 1M tokens * ${inputRatioPrice} + 补全{' '}
            {completionTokens} tokens / 1M tokens * ${completionRatioPrice} * 分组 {groupRatio} =
            ${price.toFixed(6)}
          </p>
          <p>仅供参考，以实际扣费为准</p>
        </article>
      </>
    );
  }
}

export function renderQuotaWithPrompt(quota, digits) {
  let displayInCurrency = localStorage.getItem('display_in_currency');
  displayInCurrency = displayInCurrency === 'true';
  if (displayInCurrency) {
    return `（等价金额：${renderQuota(quota, digits)}）`;
  }
  return '';
}

const colors = [
  'amber',
  'blue',
  'cyan',
  'green',
  'grey',
  'indigo',
  'light-blue',
  'lime',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'violet',
  'yellow',
];

export const modelColorMap = {
  'dall-e': 'rgb(147,112,219)', // 深紫色
  'dall-e-3': 'rgb(153,50,204)', // 介于紫罗兰和洋红之间的色调
  'gpt-3.5-turbo': 'rgb(184,227,167)', // 浅绿色
  'gpt-4': 'rgb(135,206,235)', // 天蓝色
  'gpt-4-vision-preview': 'rgb(25,25,112)', // 午夜蓝
  'tts-1': 'rgb(255,140,0)', // 深橙色
  'tts-1-hd': 'rgb(255,215,0)', // 金色
  'whisper-1': 'rgb(245,245,220)', // 米色
};

export function stringToColor(str) {
  if (!str) {
    return "lime";
  }
  let sum = 0;
  // 对字符串中的每个字符进行操作
  for (let i = 0; i < str.length; i++) {
    // 将字符的ASCII值加到sum中
    sum += str.charCodeAt(i);
  }
  // 使用模运算得到个位数
  let i = sum % colors.length;
  return colors[i];
}
