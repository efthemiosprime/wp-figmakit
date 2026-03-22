const { useState, useCallback } = wp.element;
const { __ } = wp.i18n;

import ToolbarButton from './ToolbarButton';
import FlyoutPanel from './FlyoutPanel';
import GridPanel from './panels/GridPanel';
import ColorsPanel from './panels/ColorsPanel';

const PANELS = [
	{ id: 'grid', icon: 'grid-view', label: 'Grid Settings', component: GridPanel },
	{ id: 'colors', icon: 'art', label: 'Colors', component: ColorsPanel },
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
				>
					<active.component />
				</FlyoutPanel>
			)}
		</div>
	);
}
