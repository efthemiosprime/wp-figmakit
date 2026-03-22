const { useState, useCallback } = wp.element;
const { __ } = wp.i18n;

import ToolbarButton from './ToolbarButton';
import FlyoutPanel from './FlyoutPanel';
import { GridIcon, PaletteIcon, FormIcon, PortabilityIcon, LayoutIcon } from './icons';
import GridPanel from './panels/GridPanel';
import ColorsPanel from './panels/ColorsPanel';
import PoliciesPanel from './panels/PoliciesPanel';
import PortabilityPanel from './panels/PortabilityPanel';
import PatternLibraryPanel from './panels/PatternLibraryPanel';

const PANELS = [
	{ id: 'grid', icon: GridIcon, label: 'Grid Settings', component: GridPanel },
	{ id: 'colors', icon: PaletteIcon, label: 'Colors', component: ColorsPanel },
	{ id: 'patterns', icon: LayoutIcon, label: 'Patterns', component: PatternLibraryPanel, className: 'fk-flyout--wide' },
	{ id: 'policies', icon: FormIcon, label: 'Block Policies', component: PoliciesPanel },
	{ id: 'portability', icon: PortabilityIcon, label: 'Portability', component: PortabilityPanel },
];

export default function Toolbar() {
	const [activePanel, setActivePanel] = useState(null);

	const togglePanel = useCallback((id) => {
		setActivePanel((prev) => (prev === id ? null : id));
	}, []);

	const closePanel = useCallback(() => {
		setActivePanel(null);
	}, []);

	const active = PANELS.find((p) => p.id === activePanel);

	return (
		<div className="fk-toolbar-wrapper">
			<div className="fk-toolbar">
				{PANELS.map((panel) => (
					<ToolbarButton
						key={panel.id}
						icon={panel.icon}
						label={__(panel.label, 'wp-figmakit')}
						isActive={activePanel === panel.id}
						onClick={() => togglePanel(panel.id)}
					/>
				))}
			</div>

			{active && (
				<FlyoutPanel
					title={__(active.label, 'wp-figmakit')}
					isOpen={true}
					onClose={closePanel}
					className={active.className}
				>
					<active.component />
				</FlyoutPanel>
			)}
		</div>
	);
}
