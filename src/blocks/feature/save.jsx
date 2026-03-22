const { useBlockProps, InnerBlocks } = wp.blockEditor;

export default function Save() {
	const blockProps = useBlockProps.save();

	return (
		<div {...blockProps}>
			<InnerBlocks.Content />
		</div>
	);
}
