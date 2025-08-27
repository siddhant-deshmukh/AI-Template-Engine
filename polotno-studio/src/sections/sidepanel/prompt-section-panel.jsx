import React from 'react';
import { t } from 'polotno/utils/l10n';
import { observer } from 'mobx-react-lite';
import { SectionTab } from 'polotno/side-panel';
import FaVectorSquare from '@meronex/icons/fa/FaVectorSquare';

export const PromptSectionPanel = ({ store }) => {
  

  return (
    <div></div>
  );
};

const PromptSection = {
  name: 'Prompt',
  Tab: observer((props) => (
    <SectionTab name={t('sidePanel.prompt')} {...props}>
      <FaVectorSquare className="bp5-icon bp5-icon-media" />
    </SectionTab>
  )),
  Panel: PromptSectionPanel,
};

export default PromptSection;