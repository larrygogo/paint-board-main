interface OperationButtonProps {
  onClick: () => void
  icon: React.ReactNode
  title: string
}

const OperationButton: React.FC<OperationButtonProps> = ({
  onClick,
  icon,
  title
}: OperationButtonProps) => (
  <button
    onClick={onClick}
    className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100"
    title={title}
  >
    {icon}
  </button>
)

export default OperationButton
